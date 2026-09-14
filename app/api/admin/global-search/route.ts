import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 3) {
      return NextResponse.json({ results: [] });
    }

    // Search Orders by phone, email, or orderNumber
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { phone: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { orderNumber: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Map to command palette format
    const results = orders.map((order) => ({
      name: `Order #${order.orderNumber} - ${order.customerName} (${order.phone})`,
      href: `/admin/orders/${order.id}`,
      category: "Orders Search",
      description: `Total: ৳${Number(order.total).toLocaleString()} • ${order.orderStatus}`,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Global Search GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
