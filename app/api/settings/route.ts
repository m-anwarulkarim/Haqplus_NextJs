import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllResilientSettings, setBulkResilientSettings } from "@/lib/settings-store";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settingsMap = await getAllResilientSettings();
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({});
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    await setBulkResilientSettings(body);

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
