import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isBlocked } = await req.json();

    if (typeof isBlocked !== "boolean") {
      return NextResponse.json({ error: "Invalid payload, isBlocked must be a boolean" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating customer block status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
