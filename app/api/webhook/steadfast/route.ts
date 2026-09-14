import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResilientSetting } from "@/lib/settings-store";

export async function POST(req: Request) {
  try {
    // 1. Optional Auth Token (Bearer) Validation
    const configuredToken = await getResilientSetting("STEADFAST_WEBHOOK_TOKEN");
    if (configuredToken && configuredToken.trim() !== "") {
      const authHeader = req.headers.get("authorization");
      const customTokenHeader = req.headers.get("x-webhook-token") || req.headers.get("token");

      let providedToken = "";
      if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        providedToken = authHeader.substring(7).trim();
      } else if (customTokenHeader) {
        providedToken = customTokenHeader.trim();
      }

      if (providedToken !== configuredToken.trim()) {
        console.warn("Steadfast webhook unauthorized token attempt");
        return NextResponse.json({ error: "Unauthorized webhook token" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { invoice, tracking_code, status } = body;

    if (!invoice && !tracking_code) {
      return NextResponse.json({ error: "Missing invoice or tracking code" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(invoice ? [{ orderNumber: invoice }] : []),
          ...(tracking_code ? [{ courierTrackingId: tracking_code }] : []),
        ],
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found, ignored" }, { status: 200 });
    }

    const normalizedStatus = String(status).toLowerCase();
    let newOrderStatus = order.orderStatus;
    let newPaymentStatus = order.paymentStatus;

    if (normalizedStatus === "delivered") {
      newOrderStatus = "DELIVERED";
      newPaymentStatus = "PAID";
    } else if (normalizedStatus === "cancelled") {
      newOrderStatus = "CANCELLED";
    } else if (normalizedStatus === "in_transit" || normalizedStatus === "out_for_delivery") {
      newOrderStatus = "SHIPPED";
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        courierStatus: normalizedStatus,
        orderStatus: newOrderStatus,
        paymentStatus: newPaymentStatus,
      },
    });

    return NextResponse.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Steadfast webhook processing error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

