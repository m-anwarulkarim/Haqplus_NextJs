import Link from "next/link";
import { Flame, Sparkles, Tag, ArrowRight, Clock, ShieldCheck, Truck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/store/product-card";
import { TEA_PRODUCTS } from "@/lib/data/tea-products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "স্পেশাল অফার ও ডিসকাউন্ট — haqplus Deals",
  description: "শ্রীমঙ্গলের প্রিমিয়াম অর্গানিক চা পাতায় সেরা অফার ও বিশেষ ছাড়। সীমিত সময়ের জন্য বিশেষ মূল্যে অর্ডার করুন।",
};

export default function DealsPage() {
  // Teas that have discount or special price
  const dealProducts = TEA_PRODUCTS.filter(
    (p) => (p.originalPrice && p.originalPrice > p.price) || p.discountPrice
  );

  const coupons = [
    {
      code: "HAQ10",
      discount: "১০% ছাড়",
      desc: "যেকোনো ৫৯৯ টাকার অর্ডারে ১০% ইন্সট্যান্ট ডিসকাউন্ট",
      minPurchase: "৳৫৯৯",
    },
    {
      code: "FREESHIP",
      discount: "ফ্রি ডেলিভারি",
      desc: "সমগ্র বাংলাদেশে হোম ডেলিভারি চার্জ সম্পূর্ণ ফ্রি",
      minPurchase: "৳৯৯৯",
    },
    {
      code: "FIRSTTEA",
      discount: "৳৫০ ফ্ল্যাট ছাড়",
      desc: "প্রথম অর্ডারে নিশ্চিত ৫০ টাকা মূল্যছাড় উপভোগ করুন",
      minPurchase: "৳৩৯৯",
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-sm">
            <Flame className="size-4 text-amber-300 animate-pulse" />
            <span>সীমিত সময়ের স্পেশাল ফ্ল্যাশ সেল</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            খাঁটি শ্রীমঙ্গল চায়ের উপর <br />
            <span className="text-amber-300">আকর্ষণীয় মূল্যছাড়</span>
          </h1>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            শ্রীমঙ্গলের বাছাইকৃত তাজা দুটি পাতা একটি কুঁড়ির অর্গানিক চা এখন বিশেষ অফার মূল্যে। সরাসরি বাগান থেকে সংগৃহীত সেরা মানের নিশ্চয়তা।
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" asChild className="rounded-2xl bg-white text-orange-600 hover:bg-white/90 font-bold shadow-md cursor-pointer">
              <Link href="#deals-grid">
                <span>অফারের চা দেখুন</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Truck className="size-4 text-amber-300" />
              <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 size-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 size-48 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />
      </section>

      {/* Promo Coupons Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Tag className="size-5 text-orange-600" />
          <h2 className="text-xl font-bold">অ্যাক্টিভ ডিসকাউন্ট কুপন কোড</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="relative overflow-hidden rounded-2xl border-2 border-dashed border-orange-500/40 bg-card p-5 shadow-xs hover:border-orange-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-0 font-bold text-xs">
                  {coupon.discount}
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                  সর্বনিম্ন: {coupon.minPurchase}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {coupon.desc}
              </p>

              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-2.5">
                <span className="font-mono font-bold text-sm text-foreground tracking-wider">
                  {coupon.code}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">
                  চেকআউটে ব্যবহারযোগ্য
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deals Products Grid */}
      <section id="deals-grid" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" />
              <span>ডিসকাউন্ট অফারের চা সমূহ</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              সেরা ছাড়ে তাজা অর্গানিক চা কিনুন এবং উপভোগ করুন প্রিমিয়াম স্বাদ।
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            মোট {dealProducts.length}টি অফার পণ্য
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="rounded-2xl border border-border/80 bg-muted/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">১০০% ক্যাশ অন ডেলিভারি সুবিধা</h3>
            <p className="text-xs text-muted-foreground">
              অর্ডার করতে কোনো অগ্রিম টাকা দিতে হবে না, পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।
            </p>
          </div>
        </div>

        <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
          <Link href="/shop">সবগুলো চা ব্রাউজ করুন</Link>
        </Button>
      </section>
    </div>
  );
}
