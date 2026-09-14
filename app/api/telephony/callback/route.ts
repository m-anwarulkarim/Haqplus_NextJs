import { NextResponse } from "next/server";
import { updateResilientOrder, getResilientOrders } from "@/lib/orders-store";

export async function POST(request: Request) {
  try {
    // 1. Verify Secret API Key Header if set
    const apiKeyHeader = request.headers.get("x-api-key");
    const expectedApiKey = process.env.GSM_GATEWAY_SECRET_KEY || "GSM_GATEWAY_SECRET_KEY";

    if (expectedApiKey && apiKeyHeader !== expectedApiKey) {
      console.warn("[Telephony Callback] Unauthorized callback attempt. Invalid x-api-key.");
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid API Key" },
        { status: 401 }
      );
    }

    // 2. Parse Call Result Payload from Android App
    const body = await request.json();
    const { orderId, customerPhone, status, dtmfKey, callDurationSeconds, note } = body;

    console.log(`==================================================`);
    console.log(`[Telephony Callback] Received IVR Result for Order #${orderId}`);
    console.log(`- Customer Phone: ${customerPhone}`);
    console.log(`- Status: ${status}`);
    console.log(`- DTMF Key Pressed: ${dtmfKey || 'None'}`);
    console.log(`- Call Duration: ${callDurationSeconds}s`);
    console.log(`- Note: ${note || 'N/A'}`);
    console.log(`==================================================`);

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    // Find existing order to append call log notes
    const existingOrders = await getResilientOrders({ search: orderId });
    const targetOrder = existingOrders.find((o) => o.id === orderId || o.orderNumber === orderId);

    let newOrderStatus: "CONFIRMED" | "CANCELLED" | undefined = undefined;
    let logText = `[IVR Call Log - ${new Date().toLocaleString()}] Status: ${status}`;
    if (dtmfKey) logText += `, Key Pressed: ${dtmfKey}`;
    if (callDurationSeconds) logText += `, Duration: ${callDurationSeconds}s`;

    switch (status) {
      case "CONFIRMED":
        newOrderStatus = "CONFIRMED";
        logText += " -> Customer confirmed order (Pressed 1)";
        break;

      case "CANCELLED":
        newOrderStatus = "CANCELLED";
        logText += " -> Customer cancelled order (Pressed 2)";
        break;

      case "FORWARDED":
        logText += " -> Call forwarded to Human Agent (Pressed 3)";
        break;

      case "NO_ANSWER":
      case "BUSY":
      case "FAILED":
        logText += " -> Unreachable / No Answer";
        break;
    }

    const updatedNote = targetOrder?.note
      ? `${targetOrder.note}\n${logText}`
      : logText;

    const updatePayload: any = { note: updatedNote };
    if (newOrderStatus) {
      updatePayload.orderStatus = newOrderStatus;
    }

    const result = await updateResilientOrder(targetOrder?.id || orderId, updatePayload);

    return NextResponse.json({
      success: true,
      message: `IVR Call result recorded successfully for Order #${orderId}`,
      orderId,
      updatedStatus: newOrderStatus || targetOrder?.orderStatus || status,
      resultNote: logText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Telephony Callback] Error processing callback:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
