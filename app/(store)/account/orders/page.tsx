"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ArrowLeft, 
  ExternalLink, 
  ShoppingBag,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod: string;
  trackingCode?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AccountOrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    if (sessionStatus === "authenticated") {
      fetchOrders();
    } else if (sessionStatus === "unauthenticated") {
      setLoading(false);
    }
  }, [sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">আপনার অর্ডারসমূহ লোড করা হচ্ছে...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="size-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">লগইন করুন</h1>
        <p className="text-muted-foreground mb-6 text-sm">অর্ডার হিস্ট্রি দেখতে লগইন করা প্রয়োজন।</p>
        <Button asChild>
          <Link href="/login">লগইন করুন</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle2 className="size-3" /> ডেলিশিকর্ড/সম্পন্ন</Badge>;
      case "SHIPPED":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1"><Truck className="size-3" /> কুরিয়ারে স্থানান্তরিত</Badge>;
      case "PROCESSING":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1"><Clock className="size-3" /> প্রসেসিং চলছে</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1"><XCircle className="size-3" /> বাতিলকৃত</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="size-3" /> পেন্ডিং</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/account">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">আমার অর্ডারসমূহ</h1>
          <p className="text-sm text-muted-foreground">আপনার কেনাকাটা ও কুরিয়ার ট্র্যাকিং এর হালনাগাদ তথ্য</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ShoppingBag className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">এখনো কোনো অর্ডার করা হয়নি</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            আমাদের খাঁটি অর্গানিক চা পাতার কালেকশন দেখতে শপে যান এবং প্রথম অর্ডার করুন!
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/shop">শপ কালেকশন দেখুন</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-border/80 transition-all hover:shadow-md">
              <CardHeader className="bg-muted/40 pb-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-foreground">
                        অর্ডার #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      তারিখ: {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ৳{order.totalAmount}
                    </span>
                    <Button variant="outline" size="sm" asChild className="gap-1 text-xs">
                      <Link href={`/order/track/${order.id}`}>
                        ট্র্যাক করুন <ChevronRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300">
                          🍵
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">পরিমাণ: {item.quantity}টি</p>
                        </div>
                      </div>
                      <span className="font-semibold">৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.trackingCode && (
                  <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between text-blue-700 dark:text-blue-300">
                    <span className="font-medium flex items-center gap-1.5">
                      <Truck className="size-4 text-blue-600" />
                      Steadfast কুরিয়ার আইডি: <strong className="font-mono">{order.trackingCode}</strong>
                    </span>
                    <Link href={`/orders/track`} className="underline font-semibold flex items-center gap-1 hover:text-blue-500">
                      লাইভ স্ট্যাটাস <ExternalLink className="size-3" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
