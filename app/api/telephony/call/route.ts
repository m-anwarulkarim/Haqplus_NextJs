import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResilientOrders } from "@/lib/orders-store";
import { triggerGsmAutoCall } from "@/lib/gsm-telephony";

export async function POST(request: Request) {
  try {
    const session = await auth();
    // Allow admin users or API requests with matching GSM_GATEWAY_SECRET_KEY header
    const apiKeyHeader = request.headers.get("x-api-key");
    const expectedApiKey = process.env.GSM_GATEWAY_SECRET_KEY || "GSM_GATEWAY_SECRET_KEY";
    const isAuthorizedApi = apiKeyHeader && apiKeyHeader === expectedApiKey;
    const isAdminUser = session?.user?.role === "ADMIN";

    if (!isAdminUser && !isAuthorizedApi) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId parameter is required" },
        { status: 400 }
      );
    }

    // Fetch order details
    const orders = await getResilientOrders({ search: orderId });
    const targetOrder = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

    if (!targetOrder) {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} not found` },
        { status: 404 }
      );
    }

    // Dispatch FCM Auto-Call payload
    const result = await triggerGsmAutoCall({
      orderId: targetOrder.orderNumber,
      customerPhone: targetOrder.phone,
      customerName: targetOrder.customerName,
      totalAmount: targetOrder.total,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to trigger auto-call" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `GSM Auto-Call triggered successfully for Order #${targetOrder.orderNumber}`,
      fcmMessageId: result.messageId,
      order: {
        orderNumber: targetOrder.orderNumber,
        customerName: targetOrder.customerName,
        phone: targetOrder.phone,
        total: targetOrder.total,
      },
    });
  } catch (error: any) {
    console.error("[Telephony Call API] Error triggering call:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
