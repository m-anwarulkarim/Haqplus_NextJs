"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

interface TrackedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  total: number;
  paymentMethod: string;
  orderStatus: string;
  courierTrackingId?: string | null;
  courierStatus?: string | null;
  createdAt: string;
  items: { productName: string; quantity: number; price: number }[];
}

const STATUS_STEPS = [
  { key: "PENDING", label: "অর্ডার গৃহীত", desc: "অর্ডারটি সিস্টেমে যুক্ত হয়েছে" },
  { key: "CONFIRMED", label: "নিশ্চিত", desc: "অর্ডার যাচাই ও নিশ্চিত করা হয়েছে" },
  { key: "PROCESSING", label: "প্রস্তুত হচ্ছে", desc: "বাগান থেকে চা পাতা প্যাকিং চলছে" },
  { key: "SHIPPED", label: "কুরিয়ারে হস্তান্তর", desc: "Steadfast Courier এ পাঠানো হয়েছে" },
  { key: "DELIVERED", label: "ডেলিভারি সম্পন্ন", desc: "গ্রাহক পণ্য হাতে পেয়েছেন" },
];

export default function OrderTrackPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("অর্ডার নম্বর বা ফোন নম্বর লিখুন");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setOrders([]);
        toast.error(data.error || "অর্ডার পাওয়া যায়নি");
      } else {
        setOrders(data.orders || []);
        toast.success(`${data.orders.length}টি অর্ডার পাওয়া গেছে`);
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভারের সাথে সংযোগ করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    const map: { [key: string]: number } = {
      PENDING: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
    };
    return map[status] ?? 0;
  };

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto">
      {/* Header Banner */}
      <section className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600">
          <Truck className="size-3.5" />
          <span>রিয়েল-টাইম কুরিয়ার ও ডেলিভারি ট্র্যাকিং</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          আপনার অর্ডার ট্র্যাক করুন
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          অর্ডার কনফার্মেশনের সময় প্রাপ্ত <strong>অর্ডার নম্বর</strong> (যেমন: ORD-123456) অথবা আপনার <strong>মোবাইল নম্বর</strong> লিখুন।
        </p>
      </section>

      {/* Search Input Box */}
      <section className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="অর্ডার নম্বর (যেমন: ORD-296022) বা ফোন নম্বর লিখুন..."
              className="pl-10 h-12 rounded-2xl text-xs sm:text-sm"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            {isLoading ? "খোঁজা হচ্ছে..." : "ট্র্যাক করুন"}
          </Button>
        </form>
      </section>

      {/* Search Results */}
      {hasSearched && orders.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-8 text-center space-y-3">
          <AlertCircle className="size-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground">কোনো অর্ডার খুঁজে পাওয়া যায়নি</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            আপনার দেওয়া নম্বরের সাথে কোনো অর্ডারের মিল পাওয়া যায়নি। অনুগ্রহ করে স্পেলিং চেক করে আবার চেষ্টা করুন অথবা কাস্টমার কেয়ারে যোগাযোগ করুন।
          </p>
          <Button variant="outline" size="sm" asChild className="rounded-xl text-xs">
            <Link href="/contact">হেল্পলাইনে যোগাযোগ করুন</Link>
          </Button>
        </div>
      )}

      {orders.map((order) => {
        const currentStep = getStepIndex(order.orderStatus);

        return (
          <div
            key={order.id}
            className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-sm"
          >
            {/* Order Top Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <span className="text-xs text-muted-foreground block">অর্ডার রেফারেন্স নম্বর</span>
                <span className="font-mono font-bold text-lg sm:text-xl text-foreground">
                  {order.orderNumber}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 text-xs font-bold px-3 py-1">
                  {order.orderStatus}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-4">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-muted/60 -z-0" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 -z-0"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "bg-muted text-muted-foreground border border-border"
                        } ${isCurrent ? "ring-4 ring-emerald-500/20" : ""}`}
                      >
                        {isCompleted ? <CheckCircle2 className="size-4" /> : idx + 1}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-foreground text-center max-w-16 sm:max-w-20 hidden xs:block">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Steadfast Courier Tracking Info */}
            {order.courierTrackingId && (
              <div className="rounded-2xl border border-emerald-600/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Steadfast Courier ট্র্যাকিং কোড
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-600">
                      {order.courierTrackingId}
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild className="rounded-xl text-xs gap-1.5">
                  <a
                    href={`https://steadfast.com.bd/tracking/${order.courierTrackingId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>কুরিয়ার ওয়েবসাইটে ট্র্যাক করুন</span>
                    <ExternalLink className="size-3" />
                  </a>
                </Button>
              </div>
            )}

            {/* Order Items & Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="rounded-2xl bg-muted/30 p-4 space-y-2.5">
                <span className="text-xs font-bold text-foreground block">অর্ডারের পণ্যসমূহ:</span>
                <ul className="space-y-2 text-xs divide-y divide-border/40">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between pt-1.5">
                      <span className="text-muted-foreground">
                        {item.productName} &times; <strong>{item.quantity}</strong>
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ৳{item.price * item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-2 flex justify-between text-xs font-bold">
                  <span>সর্বমোট প্রদেয় (COD):</span>
                  <span className="font-mono text-sm text-emerald-600">৳{order.total}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/30 p-4 space-y-2 text-xs">
                <span className="font-bold text-foreground block">ডেলিভারি গন্তব্য:</span>
                <p className="text-muted-foreground">
                  গ্রাহকের নাম: <strong>{order.customerName}</strong>
                </p>
                <p className="text-muted-foreground">
                  মোবাইল নম্বর: <span className="font-mono">{order.phone}</span>
                </p>
                <p className="text-muted-foreground">
                  ঠিকানা: {order.address}, {order.district}
                </p>
                <div className="pt-2">
                  <span className="inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    পেমেন্ট: ক্যাশ অন ডেলিভারি
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
