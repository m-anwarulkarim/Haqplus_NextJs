import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSteadfastReturnRequests } from "@/lib/courier/steadfast";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await getSteadfastReturnRequests();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Steadfast return requests route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch return requests" },
      { status: 500 }
    );
  }
}
