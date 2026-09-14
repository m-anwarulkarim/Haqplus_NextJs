import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Missing phone number" }, { status: 400 });
    }

    // Get existing blocked phones
    let setting = await prisma.setting.findUnique({
      where: { key: "blocked_chat_phones" }
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          key: "blocked_chat_phones",
          value: JSON.stringify([]),
        }
      });
    }

    let blockedPhones = [];
    try {
      blockedPhones = JSON.parse(setting.value);
    } catch(e) {}

    if (!blockedPhones.includes(phone)) {
      blockedPhones.push(phone);
      
      await prisma.setting.update({
        where: { key: "blocked_chat_phones" },
        data: { value: JSON.stringify(blockedPhones) }
      });
    }

    // We no longer delete the conversation here as per user request.
    // The chat history will remain visible to the admin.

    return NextResponse.json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    console.error("Block User POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
