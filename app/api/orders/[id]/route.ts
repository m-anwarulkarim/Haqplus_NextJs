import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResilientOrder, updateResilientOrder } from "@/lib/orders-store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const order = await getResilientOrder(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Permission check: admin or order owner or direct order lookup by orderNumber
    const isAdmin = session?.user?.role === "ADMIN";
    const isOwner = session?.user?.id && order.userId === session.user.id;
    const isDirectOrderNumberLookup = order.orderNumber === id;

    if (order.userId && !isAdmin && !isOwner && !isDirectOrderNumberLookup) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order GET by id error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateResilientOrder(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
