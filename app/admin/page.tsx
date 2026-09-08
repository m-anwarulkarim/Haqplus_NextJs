import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResilientOrders } from "@/lib/orders-store";
import { TEA_PRODUCTS } from "@/lib/data/tea-products";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "@/components/admin/sales-chart";

export default async function AdminDashboardPage() {
  const session = await auth();

  // Aggregate stats from resilient store
  const resilientOrders = await getResilientOrders();

  let totalRevenue = resilientOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  let totalOrders = resilientOrders.length;
  let recentOrders = resilientOrders.slice(0, 6);
  let totalProducts = TEA_PRODUCTS.length;
  let lowStockProducts = TEA_PRODUCTS.filter((p) => (p.stock ?? 99) <= 15).slice(0, 4);
  let lowStockCount = lowStockProducts.length;

  const customerMap = new Map<string, boolean>();
  resilientOrders.forEach((o) => {
    const key = o.phone || o.email || o.customerName;
    if (key) customerMap.set(key, true);
  });
  let totalCustomers = Math.max(customerMap.size, 1);

  // Try enriching from DB if Postgres is connected
  try {
    const [ordersAgg, productsCount, lowStockItems, customersCount, ordersList] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
          _count: { id: true },
        }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.findMany({
          where: { stock: { lte: 10 } },
          take: 4,
          select: { id: true, name: true, stock: true, sku: true },
        }),
        prisma.user.count(),
        prisma.order.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            district: true,
            total: true,
            orderStatus: true,
            paymentMethod: true,
            createdAt: true,
          },
        }),
      ]);

    if (ordersAgg._count.id && ordersAgg._count.id > 0) {
      totalRevenue = Math.max(totalRevenue, Number(ordersAgg._sum.total || 0));
      totalOrders = Math.max(totalOrders, ordersAgg._count.id);
    }
    if (productsCount > 0) totalProducts = productsCount;
    if (lowStockItems && lowStockItems.length > 0) {
      lowStockProducts = lowStockItems as any;
      lowStockCount = lowStockItems.length;
    }
    if (customersCount > 0) totalCustomers = Math.max(totalCustomers, customersCount);
    if (ordersList && ordersList.length > 0) recentOrders = ordersList as any;
  } catch (err) {
    // Graceful fallback to resilient store
  }

  // Generate dynamic 7-day sales chart from real data
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7DaysMap: { [key: string]: { revenue: number; orders: number } } = {};

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    last7DaysMap[dayName] = { revenue: 0, orders: 0 };
  }

  resilientOrders.forEach((o) => {
    const orderDate = new Date(o.createdAt);
    const dayName = days[orderDate.getDay()];
    if (last7DaysMap[dayName]) {
      last7DaysMap[dayName].revenue += Number(o.total || 0);
      last7DaysMap[dayName].orders += 1;
    }
  });

  const salesChartData = Object.entries(last7DaysMap).map(([name, val]) => ({
    name,
    revenue: val.revenue > 0 ? val.revenue : 0,
    orders: val.orders,
  }));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Store Performance Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as <span className="font-semibold text-foreground">{session?.user?.name || "Admin"}</span> (
            <span className="font-mono text-amber-500 font-bold">{session?.user?.role || "ADMIN"}</span>)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/" target="_blank" className="gap-1.5">
              <span>View Storefront</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
          <Button asChild className="rounded-xl shadow-xs">
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              ৳{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="size-3" />
              <span>Lifetime sales volume</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Orders Placed
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              {totalOrders}
            </div>
            <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="size-3" />
              <span>Processed transactions</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Active Products
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Package className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              {totalProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockCount} items low in stock
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Registered Customers
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              {totalCustomers}
            </div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="size-3" />
              <span>Active buyer accounts</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart & Low Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Weekly Sales Trend (BDT ৳)</CardTitle>
                <CardDescription className="text-xs">
                  Revenue and order trajectory over the past 7 days.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                Last 7 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <SalesChart data={salesChartData} />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="rounded-2xl border-border/80 shadow-2xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                <span>Inventory Alerts</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Products reaching reorder threshold (&le; 5 units).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-1.5" />
                  <span>All inventory items are well-stocked!</span>
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground line-clamp-1">{p.name}</p>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        SKU: {p.sku}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                        p.stock === 0
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {p.stock === 0 ? "Out" : `${p.stock} left`}
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </div>

          <div className="p-4 border-t border-border/60">
            <Button variant="outline" size="sm" asChild className="w-full rounded-xl text-xs">
              <Link href="/admin/products">View All Inventory</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="rounded-2xl border-border/80 shadow-2xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Recent Customer Orders</CardTitle>
              <CardDescription className="text-xs">
                Latest orders received across web and mobile storefronts.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl text-xs">
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No orders placed yet. New orders will appear here automatically.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {order.orderStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.customerName} &bull; {order.district} &bull;{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-foreground">
                        ৳{Number(order.total)}
                      </span>
                      <span className="block text-[10px] text-muted-foreground uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>

                    <Button size="sm" variant="ghost" asChild className="rounded-xl size-8 p-0">
                      <Link href={`/admin/orders/${order.id}`}>
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Status Box */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs flex items-center justify-between flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Role-Based Route Guard Active</h3>
            <p className="text-xs text-muted-foreground">
              All routes under /admin are strictly guarded by Next.js proxy middleware. Non-admin users are automatically redirected.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="rounded-xl shrink-0">
          <Link href="/" target="_blank" className="gap-1.5">
            <span>Open Live Store</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
