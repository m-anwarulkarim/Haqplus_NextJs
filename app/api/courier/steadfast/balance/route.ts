import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSteadfastBalance } from "@/lib/courier/steadfast";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const balanceData = await getSteadfastBalance();
    return NextResponse.json(balanceData);
  } catch (error) {
    console.error("Steadfast balance check error:", error);
    return NextResponse.json({ error: "Failed to check balance" }, { status: 500 });
  }
}
