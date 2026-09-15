import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResilientOrders, updateResilientOrder } from "@/lib/orders-store";
import { getPathaoOrderStatus, getPathaoCredentials } from "@/lib/courier/pathao";

export async function POST() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const creds = await getPathaoCredentials();
    if (!creds) {
      return NextResponse.json(
        {
          error: "Pathao API credentials are not configured.",
          message: "Please enter your Pathao Merchant credentials in Admin -> API Integration Center to enable live sync.",
        },
        { status: 400 }
      );
    }

    const allOrders = await getResilientOrders();
    const pathaoOrders = allOrders.filter((o) => {
      const trackId = o.courierTrackingId || "";
      const statusStr = (o.courierStatus || "").toLowerCase();
      return trackId && (statusStr.includes("pathao") || trackId.startsWith("PTH") || trackId.startsWith("PT"));
    });

    let updatedCount = 0;
    const syncResults = [];

    for (const order of pathaoOrders) {
      if (!order.courierTrackingId) continue;
      try {
        const res = await getPathaoOrderStatus(order.courierTrackingId);
        const pData = res.data || res;
        if (pData && pData.order_status) {
          const rawStatus = String(pData.order_status).toLowerCase();
          let newOrderStatus = order.orderStatus;

          if (rawStatus.includes("deliver") || rawStatus.includes("paid")) {
            newOrderStatus = "DELIVERED";
          } else if (rawStatus.includes("cancel") || rawStatus.includes("return")) {
            newOrderStatus = "CANCELLED";
          } else if (
            rawStatus.includes("transit") ||
            rawStatus.includes("dispatch") ||
            rawStatus.includes("pickup") ||
            rawStatus.includes("in_transit")
          ) {
            newOrderStatus = "SHIPPED";
          }

          await updateResilientOrder(order.id, {
            courierStatus: `pathao_${rawStatus}`,
            orderStatus: newOrderStatus,
          });

          updatedCount++;
          syncResults.push({ id: order.id, tracking: order.courierTrackingId, status: rawStatus });
        }
      } catch (err) {
        console.warn(`Pathao sync failed for order ${order.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      totalDispatched: pathaoOrders.length,
      updatedCount,
      syncResults,
    });
  } catch (error: any) {
    console.error("Pathao live sync error:", error);
    return NextResponse.json({ error: error.message || "Sync error" }, { status: 500 });
  }
}
