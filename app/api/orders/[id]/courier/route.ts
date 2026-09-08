import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSteadfastOrder, getSteadfastCredentials } from "@/lib/courier/steadfast";
import { getResilientOrder, updateResilientOrder } from "@/lib/orders-store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const order = await getResilientOrder(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.courierTrackingId || order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") {
      return NextResponse.json(
        {
          error: `অর্ডার #${order.orderNumber} ইতিমধ্যে কুরিয়ারে এন্ট্রি করা হয়েছে (Tracking Code: ${order.courierTrackingId || "এন্ট্রি সম্পন্ন"})! একই অর্ডার একাধিকবার ডবল এন্ট্রি করা যাবে না।`,
        },
        { status: 400 }
      );
    }

    const codAmount = order.paymentMethod === "COD" ? Number(order.total) : 0;
    const fullAddress = `${order.address}, ${order.area}, ${order.district}, ${order.division}`;

    const courierRes = await createSteadfastOrder({
      invoice: order.orderNumber,
      recipient_name: order.customerName,
      recipient_phone: order.phone,
      recipient_address: fullAddress,
      cod_amount: codAmount,
      note: order.note || undefined,
    });

    if (courierRes.status === 200 && courierRes.consignment) {
      const trackingCode = courierRes.consignment.tracking_code;

      const updatedOrder = await updateResilientOrder(order.id, {
        courierTrackingId: trackingCode,
        courierStatus: courierRes.consignment.status || "in_review",
        orderStatus: "SHIPPED",
      });

      return NextResponse.json({
        message: courierRes.isSimulated
          ? "Dispatched in Demo Mode (API Key missing in Admin -> API)"
          : "Order dispatched to Steadfast Courier successfully",
        trackingCode,
        isSimulated: courierRes.isSimulated || false,
        order: updatedOrder,
      });
    } else {
      return NextResponse.json(
        { error: courierRes.message || "Failed to dispatch with courier", details: courierRes },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Dispatch to courier error:", error);
    return NextResponse.json({ error: error.message || "Courier error" }, { status: 500 });
  }
}
