import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notifications = [];

    // 1. Get recent pending orders
    const recentOrders = await prisma.order.findMany({
      where: {
        orderStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    for (const order of recentOrders) {
      notifications.push({
        id: `order-${order.id}`,
        title: `New Order #${order.orderNumber} Received`,
        description: `Customer from ${order.district} placed order for ৳${order.total}`,
        time: order.createdAt.toISOString(),
        type: "order",
        unread: true,
        link: `/admin/orders/${order.id}`,
      });
    }

    // 2. Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 10,
        },
      },
      take: 5,
    });

    for (const product of lowStockProducts) {
      notifications.push({
        id: `stock-${product.id}`,
        title: "Low Stock Alert",
        description: `${product.name} has only ${product.stock} units left in stock`,
        time: new Date().toISOString(), // Or a fixed time if needed
        type: "stock",
        unread: true,
        link: `/admin/products`,
      });
    }

    // Sort notifications by time descending (newest first)
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
