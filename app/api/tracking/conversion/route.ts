import { NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventName,
      eventId,
      eventSourceUrl,
      userData = {},
      customData = {},
      testEventCode,
    } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: "eventName is required (e.g. ViewContent, AddToCart, Purchase)" },
        { status: 400 }
      );
    }

    // Extract Client IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      undefined;

    // Extract User Agent
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    // Extract _fbp and _fbc cookies
    const cookieHeader = req.headers.get("cookie") || "";
    let fbp: string | undefined;
    let fbc: string | undefined;

    for (const cookie of cookieHeader.split(";")) {
      const [name, val] = cookie.trim().split("=");
      if (name === "_fbp") fbp = val;
      if (name === "_fbc") fbc = val;
    }

    const capiResult = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl: eventSourceUrl || req.headers.get("referer") || undefined,
      userData: {
        ...userData,
        clientIp: userData.clientIp || clientIp,
        clientUserAgent: userData.clientUserAgent || clientUserAgent,
        fbp: userData.fbp || fbp,
        fbc: userData.fbc || fbc,
      },
      customData,
      testEventCode,
    });

    return NextResponse.json(capiResult);
  } catch (error: any) {
    console.error("Meta Conversion API route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Meta CAPI event" },
      { status: 500 }
    );
  }
}
