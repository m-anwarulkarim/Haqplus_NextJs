import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkSteadfastFraud } from "@/lib/courier/steadfast";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const rawData = await checkSteadfastFraud(phone);

    // Normalize Steadfast Fraud API Response (handles official field names like total_delivred, total_cancelled, total_parcels)
    const d = rawData?.data || rawData || {};

    const success_parcel = Number(
      d.total_delivred ??
      d.total_delivered ??
      d.success_parcel ??
      d.success_parcels ??
      d.successful_delivery ??
      d.delivered ??
      d.successful ??
      0
    );

    const cancelled_parcel = Number(
      d.total_cancelled ??
      d.total_canceled ??
      d.cancelled_parcel ??
      d.cancelled_parcels ??
      d.returned ??
      d.cancelled ??
      d.cancellation ??
      0
    );

    let total_parcel = Number(
      d.total_parcels ??
      d.total_parcel ??
      d.total_delivery ??
      d.total ??
      d.total_orders ??
      0
    );

    if (total_parcel < (success_parcel + cancelled_parcel)) {
      total_parcel = success_parcel + cancelled_parcel;
    }

    let success_rate = 100;
    if (total_parcel > 0) {
      success_rate = Number(((success_parcel / total_parcel) * 100).toFixed(1));
    }

    let risk_level: "SAFE" | "MODERATE" | "HIGH_RISK" | "NO_DATA" = "SAFE";
    if (total_parcel === 0) {
      risk_level = "NO_DATA";
    } else if (cancelled_parcel > 2 || success_rate < 60) {
      risk_level = "HIGH_RISK";
    } else if (cancelled_parcel > 0 || success_rate < 85) {
      risk_level = "MODERATE";
    }

    return NextResponse.json({
      success: true,
      phone,
      total_parcel,
      success_parcel,
      cancelled_parcel,
      success_rate,
      risk_level,
      message: rawData.message || null,
      raw: rawData,
    });
  } catch (error: any) {
    console.error("Fraud check route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform fraud check" },
      { status: 500 }
    );
  }
}
