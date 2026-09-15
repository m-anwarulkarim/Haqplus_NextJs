import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResilientOrder, updateResilientOrder } from "@/lib/orders-store";
import { createPathaoOrder, getPathaoCredentials } from "@/lib/courier/pathao";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, storeId, recipientCity, recipientZone, recipientArea, deliveryType, itemType, weight } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const creds = await getPathaoCredentials();
    if (!creds) {
      return NextResponse.json(
        { error: "Pathao API credentials required. Please enter Pathao credentials in Admin -> API Integration Center." },
        { status: 400 }
      );
    }

    const order = await getResilientOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pathaoPayload = {
      store_id: storeId || 1,
      merchant_order_id: order.orderNumber,
      recipient_name: order.customerName,
      recipient_phone: order.phone,
      recipient_address: order.address,
      recipient_city: recipientCity || 1, // Default Dhaka
      recipient_zone: recipientZone || 1,
      recipient_area: recipientArea || undefined,
      delivery_type: deliveryType || 48, // 48 = Normal, 12 = On Demand
      item_type: itemType || 2, // 2 = Parcel
      special_instruction: order.note || "",
      item_quantity: order.items?.length || 1,
      item_weight: weight || 0.5,
      amount_to_collect: Number(order.total || 0),
      item_description: order.items?.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ") || "General Product",
    };

    const result = await createPathaoOrder(pathaoPayload);

    if (result.type === "success" || result.consignment_id || result.data?.consignment_id) {
      const consignmentId = result.consignment_id || result.data?.consignment_id || `PTH-${Date.now()}`;
      await updateResilientOrder(order.id, {
        courierTrackingId: String(consignmentId),
        courierStatus: "pathao_pending",
        orderStatus: "SHIPPED",
      });

      return NextResponse.json({
        success: true,
        consignment_id: consignmentId,
        message: "Order successfully dispatched to Pathao Courier",
        data: result,
      });
    }

    return NextResponse.json(
      { error: result.message || result.error || "Failed to dispatch order to Pathao Courier" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Pathao dispatch error:", error);
    return NextResponse.json({ error: error.message || "Dispatch error" }, { status: 500 });
  }
}
