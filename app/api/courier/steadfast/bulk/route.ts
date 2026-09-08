import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSteadfastOrder, getSteadfastCredentials } from "@/lib/courier/steadfast";
import { getResilientOrders, updateResilientOrder } from "@/lib/orders-store";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const creds = await getSteadfastCredentials();
    if (!creds) {
      return NextResponse.json(
        {
          error:
            "কুরিয়ারে এন্ট্রি করার জন্য প্রথমে এডমিন প্যানেল (API Integration) থেকে Steadfast Courier-এর API Key এবং Secret Key যুক্ত করুন। API ছাড়া কুরিয়ার এন্ট্রি হবে না।",
        },
        { status: 400 }
      );
    }

    const { orderIds } = await req.json();
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "No orders provided" }, { status: 400 });
    }

    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        where: {
          id: { in: orderIds },
          courierTrackingId: null,
          orderStatus: { notIn: ["SHIPPED", "DELIVERED", "RETURNED"] },
        },
      });
    } catch (dbErr) {
      // Prisma DB down, fall back
    }

    if (orders.length === 0) {
      const allResilient = await getResilientOrders();
      orders = allResilient.filter(
        (o) =>
          orderIds.includes(o.id) &&
          !o.courierTrackingId &&
          !["SHIPPED", "DELIVERED", "RETURNED"].includes(o.orderStatus || "")
      );
    }

    if (orders.length === 0) {
      return NextResponse.json(
        {
          error: "আপনি যে অর্ডার(গুলি) নির্বাচন করেছেন তা ইতিমধ্যে কুরিয়ারে এন্ট্রি করা হয়েছে! একই অর্ডার একাধিকবার ডবল এন্ট্রি করা যাবে না।",
        },
        { status: 400 }
      );
    }

    const results = [];
    for (const order of orders) {
      try {
        const codAmount = order.paymentMethod === "COD" ? Number(order.total) : 0;
        const fullAddress = `${order.address}, ${order.area}, ${order.district}, ${order.division}`;

        const res = await createSteadfastOrder({
          invoice: order.orderNumber,
          recipient_name: order.customerName,
          recipient_phone: order.phone,
          recipient_address: fullAddress,
          cod_amount: codAmount,
          note: order.note || undefined,
        });

        if (res.status === 200 && res.consignment) {
          await updateResilientOrder(order.id, {
            courierTrackingId: res.consignment.tracking_code,
            courierStatus: res.consignment.status || "in_review",
            orderStatus: "SHIPPED",
          });
          results.push({ orderId: order.id, success: true, tracking: res.consignment.tracking_code });
        } else {
          results.push({ orderId: order.id, success: false, error: res.message });
        }
      } catch (err: any) {
        results.push({ orderId: order.id, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      total: orders.length,
      processed: results,
      successCount: results.filter((r) => r.success).length,
    });
  } catch (error) {
    console.error("Bulk courier dispatch error:", error);
    return NextResponse.json({ error: "Failed to process bulk dispatch" }, { status: 500 });
  }
}
