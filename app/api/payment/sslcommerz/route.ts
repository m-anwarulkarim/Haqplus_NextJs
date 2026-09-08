import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // In production, initiate SSLCommerz Session (POST https://sandbox.sslcommerz.com/gwprocess/v4/api.php)
    // For placeholder/testing, generate simulated redirect
    const sessionKey = `SSL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const gatewayUrl = `/order/success/${order.orderNumber}?payment=sslcommerz&sessionkey=${sessionKey}`;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
      },
    });

    return NextResponse.json({
      status: "SUCCESS",
      gatewayUrl,
      sessionKey,
      amount: amount || Number(order.total),
    });
  } catch (error) {
    console.error("SSLCommerz payment initiation error:", error);
    return NextResponse.json({ error: "SSLCommerz gateway error" }, { status: 500 });
  }
}
