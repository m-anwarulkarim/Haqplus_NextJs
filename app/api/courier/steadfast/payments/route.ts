import { NextResponse } from "next/server";
import { getSteadfastPayments } from "@/lib/courier/steadfast";

export async function GET() {
  try {
    const data = await getSteadfastPayments();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/courier/steadfast/payments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Steadfast payment history" },
      { status: 500 }
    );
  }
}
