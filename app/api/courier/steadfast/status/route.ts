import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getSteadfastStatusByTrackingCode,
  getSteadfastStatusByCid,
  getSteadfastStatusByInvoice,
} from "@/lib/courier/steadfast";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const trackingCode = searchParams.get("trackingCode");
    const cid = searchParams.get("cid");
    const invoice = searchParams.get("invoice");

    if (trackingCode) {
      const data = await getSteadfastStatusByTrackingCode(trackingCode);
      return NextResponse.json(data);
    }

    if (cid) {
      const data = await getSteadfastStatusByCid(cid);
      return NextResponse.json(data);
    }

    if (invoice) {
      const data = await getSteadfastStatusByInvoice(invoice);
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Provide trackingCode, cid, or invoice query parameter" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Courier status query error:", error);
    return NextResponse.json({ error: error.message || "Failed to query status" }, { status: 500 });
  }
}
