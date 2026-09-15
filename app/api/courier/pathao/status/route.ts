import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPathaoOrderStatus } from "@/lib/courier/pathao";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const consignmentId = searchParams.get("consignmentId") || searchParams.get("trackingCode");

    if (!consignmentId) {
      return NextResponse.json(
        { error: "Consignment ID or tracking code is required" },
        { status: 400 }
      );
    }

    const result = await getPathaoOrderStatus(consignmentId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Pathao status route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query Pathao order status" },
      { status: 500 }
    );
  }
}
