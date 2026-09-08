import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 });
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database and update fcmToken
    await prisma.user.upsert({
      where: { email: session.user.email },
      update: { fcmToken: token },
      create: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || "User",
        role: session.user.role || "ADMIN",
        fcmToken: token,
      },
    });

    return NextResponse.json({ success: true, message: "FCM token saved successfully" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
