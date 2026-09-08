import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResilientOrders, updateResilientOrder } from "@/lib/orders-store";
import { getSteadfastStatusByTrackingCode, getSteadfastCredentials } from "@/lib/courier/steadfast";

export async function POST() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const creds = await getSteadfastCredentials();
    if (!creds) {
      return NextResponse.json(
        {
          error: "Steadfast API Key & Secret Key are not configured.",
          isSimulated: true,
          message: "Please configure your Steadfast API Key and Secret Key in Admin -> API Integration Center to sync real delivery updates.",
        },
        { status: 400 }
      );
    }

    const allOrders = await getResilientOrders();
    const dispatchedOrders = allOrders.filter((o) => o.courierTrackingId);

    let updatedCount = 0;
    const syncResults = [];

    for (const order of dispatchedOrders) {
      if (!order.courierTrackingId) continue;
      try {
        const res = await getSteadfastStatusByTrackingCode(order.courierTrackingId);
        if (res && res.status === 200 && res.delivery_status) {
          const newCourierStatus = String(res.delivery_status).toLowerCase();
          let newOrderStatus = order.orderStatus;

          if (newCourierStatus === "delivered") {
            newOrderStatus = "DELIVERED";
          } else if (newCourierStatus === "cancelled") {
            newOrderStatus = "CANCELLED";
          } else if (newCourierStatus === "in_transit" || newCourierStatus === "out_for_delivery") {
            newOrderStatus = "SHIPPED";
          }

          await updateResilientOrder(order.id, {
            courierStatus: newCourierStatus,
            orderStatus: newOrderStatus,
          });

          updatedCount++;
          syncResults.push({ id: order.id, tracking: order.courierTrackingId, status: newCourierStatus });
        }
      } catch (err) {
        console.warn(`Sync failed for order ${order.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      totalDispatched: dispatchedOrders.length,
      updatedCount,
      syncResults,
    });
  } catch (error: any) {
    console.error("Steadfast sync error:", error);
    return NextResponse.json({ error: error.message || "Sync error" }, { status: 500 });
  }
}
