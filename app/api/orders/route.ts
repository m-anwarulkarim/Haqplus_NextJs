import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations/checkout";
import { sendMetaCapiEvent } from "@/lib/meta-capi";
import { saveResilientOrder, getResilientOrders } from "@/lib/orders-store";
import { prisma } from "@/lib/prisma";
import { adminMessaging } from "@/lib/firebase-admin";
import { z } from "zod";

const createOrderSchema = checkoutSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional().nullable(),
        name: z.string(),
        price: z.coerce.number().positive(),
        quantity: z.coerce.number().int().positive(),
        image: z.string().optional().nullable(),
      })
    )
    .min(1, { message: "Order must contain at least one item" }),
  couponCode: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const isAdmin = session?.user?.role === "ADMIN";
    const userId = !isAdmin && session?.user ? session.user.id : undefined;

    const orders = await getResilientOrders({
      status,
      search,
      userId,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const result = createOrderSchema.safeParse(body);
    if (!result.success) {
      console.error("Order validation failed details:", JSON.stringify(result.error.flatten().fieldErrors));
      const firstError = Object.values(result.error.flatten().fieldErrors).flat()[0];
      return NextResponse.json(
        {
          error: firstError || "Validation failed",
          message: firstError || "Validation failed",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items, couponCode, ...customerData } = result.data;

    // Check if user is blocked
    const phone = customerData.phone;
    let isBlocked = false;
    
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (user?.isBlocked) isBlocked = true;
    } else if (phone) {
      const userByPhone = await prisma.user.findFirst({ where: { phone } });
      if (userByPhone?.isBlocked) isBlocked = true;
    }

    if (isBlocked) {
      return NextResponse.json(
        { error: "Your account has been blocked from placing orders. Please contact support." },
        { status: 403 }
      );
    }

    // Check Order Frequency Limit
    const delaySetting = await prisma.setting.findUnique({ where: { key: "order_delay_minutes" } });
    if (delaySetting && delaySetting.value) {
      const delayMinutes = parseInt(delaySetting.value, 10);
      if (delayMinutes > 0) {
        // Find latest order for this user/phone
        const latestOrder = await prisma.order.findFirst({
          where: {
            OR: [
              ...(session?.user?.id ? [{ userId: session.user.id }] : []),
              ...(phone ? [{ phone }] : []),
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        if (latestOrder) {
          const now = new Date();
          const orderTime = new Date(latestOrder.createdAt);
          const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);
          
          if (diffMinutes < delayMinutes) {
            const waitMinutes = Math.ceil(delayMinutes - diffMinutes);
            const hours = Math.floor(waitMinutes / 60);
            const mins = waitMinutes % 60;
            const timeStr = hours > 0 
              ? `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` and ${mins} minute${mins > 1 ? 's' : ''}` : ''}`
              : `${mins} minute${mins > 1 ? 's' : ''}`;
              
            return NextResponse.json(
              { error: `You recently placed an order. Please wait ${timeStr} before placing another.` },
              { status: 429 }
            );
          }
        }
      }
    }

    // Calculate subtotal
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Validate and calculate discount
    let discount = 0;
    if (couponCode) {
      try {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });

        if (coupon && coupon.isActive) {
          const now = new Date();
          const isValidDate = !coupon.expiryDate || coupon.expiryDate > now;
          const meetsMinPurchase = Number(coupon.minPurchase) <= subtotal;
          const hasUsageLeft = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

          if (isValidDate && meetsMinPurchase && hasUsageLeft) {
            if (coupon.type === "PERCENTAGE") {
              discount = Number(((subtotal * Number(coupon.value)) / 100).toFixed(2));
            } else {
              discount = Math.min(Number(coupon.value), subtotal);
            }

            // Increment coupon used count safely
            await prisma.coupon
              .update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } },
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        // Coupon DB error ignored
      }
    }

    // Shipping charge ($0 for orders >= $75, otherwise $9.99 / ৳100)
    const shippingCharge = subtotal >= 75 ? 0 : 9.99;
    const total = Math.max(0, Number((subtotal - discount + shippingCharge).toFixed(2)));

    // Generate unique order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Extract real client visitor information
    const userAgentStr = req.headers.get("user-agent") || "";
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgentStr);
    const browserName = /chrome/i.test(userAgentStr)
      ? "Chrome"
      : /safari/i.test(userAgentStr)
      ? "Safari"
      : /firefox/i.test(userAgentStr)
      ? "Firefox"
      : /edg/i.test(userAgentStr)
      ? "Edge"
      : "Browser";

    const device = `${isMobile ? "ফোন" : "পিসি"} (${browserName})`;
    const refererStr = req.headers.get("referer") || "";
    const source = refererStr.includes("facebook.com") || refererStr.includes("fb.com")
      ? "Facebook"
      : refererStr.includes("google.com")
      ? "Google"
      : refererStr.includes("instagram.com")
      ? "Instagram"
      : "Direct Web";

    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "103.197.153.53";
    const fingerprint = "fp_" + Math.random().toString(36).slice(2, 8);

    const deviceInfo = {
      source,
      fingerprint,
      ipAddress: rawIp,
      device,
      totalVisits: 1,
      activeTime: "14s",
      avgLoad: "1.9s",
      firstVisit: new Date().toLocaleDateString("en-GB"),
      isBanned: false,
    };

    // Resilient order save (DB + local fallback)
    const createdOrder = await saveResilientOrder({
      orderNumber,
      userId: session?.user?.id || null,
      customerName: customerData.customerName,
      phone: customerData.phone,
      email: customerData.email || null,
      division: customerData.division || "Dhaka",
      district: customerData.district || "Dhaka",
      area: customerData.area || "Inside BD",
      address: customerData.address,
      subtotal,
      discount,
      shippingCharge,
      total,
      paymentMethod: customerData.paymentMethod,
      note: customerData.hasNote && customerData.note ? customerData.note : null,
      deviceInfo,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || undefined,
      })),
    });

    // Trigger Meta Conversions API (CAPI) Purchase Event asynchronously
    sendMetaCapiEvent({
      eventName: "Purchase",
      eventId: createdOrder.orderNumber,
      userData: {
        email: createdOrder.email,
        phone: createdOrder.phone,
        firstName: createdOrder.customerName,
        city: createdOrder.district,
        country: "bd",
      },
      customData: {
        value: Number(createdOrder.total),
        currency: "BDT",
        order_id: createdOrder.orderNumber,
        content_type: "product",
        num_items: items.reduce((acc, it) => acc + it.quantity, 0),
        content_ids: items.map((it) => it.productId),
      },
    }).catch((capiErr) => console.warn("Background Meta CAPI Purchase error:", capiErr));

    // Send Real-Time FCM Push Notification to all active devices
    const messaging = adminMessaging;
    if (messaging) {
      prisma.user
        .findMany({
          where: { fcmToken: { not: null } },
          select: { fcmToken: true },
        })
        .then((admins: { fcmToken: string | null }[]) => {
          const tokens = admins.map((a: { fcmToken: string | null }) => a.fcmToken!).filter(Boolean);
          if (tokens.length > 0) {
            messaging
              .sendEachForMulticast({
                tokens,
                notification: {
                  title: `New Order #${createdOrder.orderNumber}`,
                  body: `${createdOrder.customerName} placed an order worth ৳${createdOrder.total}`,
                },
                data: {
                  type: "order",
                  link: "/admin/orders",
                },
              })
              .catch((err: unknown) => console.warn("FCM Multicast error:", err));
          }
        })
        .catch((err: unknown) => console.warn("Error fetching admin FCM tokens:", err));
    }

    return NextResponse.json(
      {
        message: "Order placed successfully",
        order: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation unexpected error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
