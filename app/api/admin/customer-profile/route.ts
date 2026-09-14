import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Get the conversation to find phone and email
    const conversation = await prisma.conversation.findUnique({
      where: { sessionId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Find previous orders by this phone or email
    let orders: any[] = [];
    if (conversation.customerPhone || conversation.customerEmail) {
      const orConditions: any[] = [];
      if (conversation.customerPhone) {
        orConditions.push({ phone: conversation.customerPhone });
      }
      if (conversation.customerEmail) {
        orConditions.push({ email: conversation.customerEmail });
      }

      orders = await prisma.order.findMany({
        where: {
          OR: orConditions,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: true,
        },
      });
    }

    return NextResponse.json({
      details: {
        name: conversation.customerName,
        phone: conversation.customerPhone,
        email: conversation.customerEmail,
        visitCount: conversation.visitCount,
        firstVisit: conversation.firstVisit,
      },
      orders,
    });
  } catch (error) {
    console.error("Customer Profile GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
