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

    // In production, initiate bKash checkout payment request (createPayment API)
    // For placeholder/testing, generate simulated bKash payment authorization URL
    const paymentUrl = `/order/success/${order.orderNumber}?payment=bkash&trxId=TRX${Date.now().toString().slice(-8)}`;

    // Automatically simulate marking as paid when returning to callback
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
      },
    });

    return NextResponse.json({
      success: true,
      gateway: "bKash",
      paymentUrl,
      amount: amount || Number(order.total),
      trxId: `BKASH-${Date.now()}`,
    });
  } catch (error) {
    console.error("bKash payment initiation error:", error);
    return NextResponse.json({ error: "bKash gateway error" }, { status: 500 });
  }
}
