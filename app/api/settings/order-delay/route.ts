import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "order_delay_minutes" },
    });
    
    // Default to 0 (disabled) if not found
    const delayMinutes = setting ? parseInt(setting.value, 10) : 0;
    
    return NextResponse.json({ delayMinutes });
  } catch (error) {
    console.error("Error fetching order delay setting:", error);
    return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { delayMinutes } = await req.json();

    if (typeof delayMinutes !== "number" || delayMinutes < 0) {
      return NextResponse.json({ error: "Invalid delay value" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: "order_delay_minutes" },
      update: { value: delayMinutes.toString() },
      create: { key: "order_delay_minutes", value: delayMinutes.toString() },
    });

    return NextResponse.json({ success: true, delayMinutes });
  } catch (error) {
    console.error("Error updating order delay setting:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
