import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/chat - Fetch conversation messages for a session
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      id: conversation.id,
      isClosed: conversation.isClosed,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Chat GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/chat - Send a new message
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, text, sender = "CUSTOMER", customerName, customerEmail, customerPhone, visitCount, firstVisit } = body;

    if (!sessionId || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if customer is blocked
    if (sender === "CUSTOMER" && customerPhone) {
      const setting = await prisma.setting.findUnique({ where: { key: "blocked_chat_phones" } });
      if (setting) {
        try {
          const blockedPhones = JSON.parse(setting.value);
          if (blockedPhones.includes(customerPhone)) {
            return NextResponse.json({ error: "You are blocked from sending messages" }, { status: 403 });
          }
        } catch (e) {}
      }
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: { sessionId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          sessionId,
          customerName: customerName || "Guest",
          customerEmail,
          customerPhone,
          visitCount: visitCount || 1,
          firstVisit: firstVisit || null,
        },
      });
    } else if (visitCount || firstVisit) {
      // Update metrics if provided
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          visitCount: visitCount || conversation.visitCount,
          firstVisit: firstVisit || conversation.firstVisit,
        }
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender,
        text,
        isRead: false,
      },
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("Chat POST Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

import { auth } from "@/lib/auth";

// DELETE /api/chat?messageId=xxx or ?conversationId=xxx
// DELETE endpoint removed as per user request
