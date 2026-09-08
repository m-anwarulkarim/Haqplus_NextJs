import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getResilientOrders } from "@/lib/orders-store";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    let users: any[] = [];
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
              total: true,
              orderStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr) {
      // Prisma offline, proceed with order store fallback
    }

    const customerMap = new Map<string, any>();

    // Add users from DB
    users.forEach((u) => {
      const orderCount = u.orders?.length || 0;
      const totalSpent = u.orders?.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0;
      const key = (u.phone || u.email || u.id).toLowerCase();
      customerMap.set(key, {
        id: u.id,
        name: u.name || "Anonymous",
        email: u.email || "No email",
        phone: u.phone || "No phone",
        role: u.role,
        image: u.image,
        createdAt: u.createdAt,
        orderCount,
        totalSpent,
      });
    });

    // Add / enrich from real resilient orders
    const resilientOrders = await getResilientOrders();
    resilientOrders.forEach((o) => {
      const key = (o.phone || o.email || o.customerName).toLowerCase();
      const existing = customerMap.get(key);

      if (existing) {
        existing.orderCount = Math.max(existing.orderCount, 1);
        if (existing.totalSpent === 0) {
          existing.totalSpent += Number(o.total || 0);
        }
      } else {
        customerMap.set(key, {
          id: o.userId || `cust_${o.phone || Math.random().toString(36).slice(2, 7)}`,
          name: o.customerName,
          email: o.email || "No email",
          phone: o.phone,
          role: "CUSTOMER",
          image: null,
          createdAt: o.createdAt,
          orderCount: 1,
          totalSpent: Number(o.total || 0),
        });
      }
    });

    let formatted = Array.from(customerMap.values());

    if (search) {
      formatted = formatted.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search)
      );
    }

    formatted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
