import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResilientOrder, updateResilientOrder } from "@/lib/orders-store";
import { createPathaoOrder, getPathaoCredentials, getPathaoStores } from "@/lib/courier/pathao";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { orderIds } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "orderIds must be a non-empty array" }, { status: 400 });
    }

    const creds = await getPathaoCredentials();
    if (!creds) {
      return NextResponse.json(
        { error: "Pathao API Key and Secret Key are strictly required. Please configure credentials in Admin -> API Integration." },
        { status: 400 }
      );
    }

    // Fetch Store list to get default store_id
    const storesRes = await getPathaoStores();
    const storesList = storesRes.data?.data || storesRes.data || [];
    const defaultStoreId = storesList[0]?.store_id || 1;

    let successCount = 0;
    let failCount = 0;
    const processed: any[] = [];

    for (const orderId of orderIds) {
      try {
        const order = await getResilientOrder(orderId);
        if (!order) {
          failCount++;
          processed.push({ orderId, success: false, error: "Order not found" });
          continue;
        }

        const pathaoPayload = {
          store_id: defaultStoreId,
          merchant_order_id: order.orderNumber,
          recipient_name: order.customerName,
          recipient_phone: order.phone,
          recipient_address: order.address,
          recipient_city: 1, // Default Dhaka City
          recipient_zone: 1,
          delivery_type: 48, // 48 = Normal Delivery
          item_type: 2, // 2 = Parcel
          special_instruction: order.note || "",
          item_quantity: order.items?.length || 1,
          item_weight: 0.5,
          amount_to_collect: Number(order.total || 0),
          item_description: order.items?.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ") || "General Product",
        };

        const res = await createPathaoOrder(pathaoPayload);
        const consignmentId = res.consignment_id || res.data?.consignment_id || `PTH-${Date.now()}`;

        if (res.type === "success" || res.consignment_id || res.data?.consignment_id || res.code === 200) {
          await updateResilientOrder(order.id, {
            courierTrackingId: String(consignmentId),
            courierStatus: "pathao_pending",
            orderStatus: "SHIPPED",
          });

          successCount++;
          processed.push({ orderId, success: true, trackingCode: consignmentId });
        } else {
          failCount++;
          processed.push({ orderId, success: false, error: res.message || res.error || "Pathao dispatch failed" });
        }
      } catch (err: any) {
        failCount++;
        processed.push({ orderId, success: false, error: err.message || "Dispatch error" });
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failCount,
      processed,
    });
  } catch (error: any) {
    console.error("Pathao bulk dispatch error:", error);
    return NextResponse.json({ error: error.message || "Bulk dispatch error" }, { status: 500 });
  }
}
