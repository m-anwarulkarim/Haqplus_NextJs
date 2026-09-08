"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Copy,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Plus,
  Eye,
  Layers,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { LANDING_PAGES, LandingPageData } from "@/lib/data/landing-pages";

export default function AdminLandingPagesManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load landing page order metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders placed via landing pages
  const safeOrders = Array.isArray(orders) ? orders : [];
  const landingOrders = safeOrders.filter(
    (o) =>
      o.note?.includes("Landing Page") ||
      o.deviceInfo?.source?.includes("Landing") ||
      o.items?.some((it: any) => it.productName?.includes("স্পেশাল") || it.productName?.includes("প্যাকেজ"))
  );

  const totalLandingRevenue = landingOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const copyToClipboard = (slug: string) => {
    const fullUrl = `${window.location.origin}/landing/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success(`Copied link to clipboard: ${fullUrl}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-0.5 text-xs font-bold mb-1">
            <Sparkles className="size-3.5" />
            <span>Landing Page Campaign System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Landing Pages List (ল্যান্ডিং পেজসমূহ)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            প্রচারমূলক ল্যান্ডিং পেজের তালিকা, সরাসরি অর্ডার ট্র্যাকিং এবং রেজাল্ট ম্যানেজমেন্ট।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchOrders}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Analytics</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5"
          >
            <Link href="/landing/black-tea-deal" target="_blank">
              <Plus className="size-3.5" />
              <span>Preview Demo Page</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Active Landing Pages */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Total Active Landing Pages</span>
            <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="size-4" />
            </div>
          </div>
          <strong className="text-2xl font-extrabold text-foreground font-mono block">
            {LANDING_PAGES.length} Pages
          </strong>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            ১০০% আলাদা কোড ও স্বতন্ত্র ফাইল
          </span>
        </div>

        {/* Orders From Landing Pages */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Landing Page Orders</span>
            <div className="size-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="size-4" />
            </div>
          </div>
          <strong className="text-2xl font-extrabold text-foreground font-mono block">
            {landingOrders.length} Orders
          </strong>
          <span className="text-[11px] text-muted-foreground block">
            সরাসরি অ্যাডমিন ড্যাশবোর্ডে যুক্ত হওয়া অর্ডার
          </span>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Landing Revenue Earned</span>
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <strong className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block">
            ৳{totalLandingRevenue}
          </strong>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            ক্যাম্পেইন বিক্রয় মোট হিসাব
          </span>
        </div>
      </div>

      {/* Landing Pages Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-emerald-600" />
            <span>Active Landing Page Directory</span>
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {LANDING_PAGES.length} active files
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground text-xs font-semibold">
              <tr>
                <th className="p-3.5 text-center w-[50px] font-bold">#</th>
                <th className="p-3.5 w-[70px]">Image</th>
                <th className="p-3.5">Landing Page Title</th>
                <th className="p-3.5">URL Slug</th>
                <th className="p-3.5">Offer Price</th>
                <th className="p-3.5">Orders Received</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {LANDING_PAGES.map((page, index) => {
                const pageOrders = landingOrders.filter(
                  (o) => o.note?.includes(page.slug) || o.note?.includes(page.bengaliTitle)
                );
                const pageRevenue = pageOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

                return (
                  <tr key={page.id} className="hover:bg-muted/40 transition-colors border-b border-border/40">
                    {/* Serial Index */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground font-mono text-xs">
                        <GripVertical className="size-3.5 opacity-60 cursor-grab" />
                        <span>{index + 1}</span>
                      </div>
                    </td>

                    {/* Thumbnail Image */}
                    <td className="p-3.5">
                      <div className="relative size-12 rounded-xl overflow-hidden bg-muted/60 border border-border/60 shrink-0">
                        <img
                          src={page.bannerImage}
                          alt={page.title}
                          className="size-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{page.bengaliTitle}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{page.title}</p>
                      </div>
                    </td>

                    {/* URL Slug */}
                    <td className="p-3.5 font-mono">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                        /landing/{page.slug}
                      </span>
                    </td>

                    {/* Offer Price */}
                    <td className="p-3.5 font-mono">
                      <div className="flex items-baseline gap-1.5 text-sm">
                        <span className="text-xs text-muted-foreground line-through">
                          ৳{page.originalPrice}
                        </span>
                        <span className="font-bold text-blue-500">৳{page.offerPrice}</span>
                      </div>
                    </td>

                    {/* Received Orders */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-xs">
                        {pageOrders.length} Orders (৳{pageRevenue})
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        Active
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-3.5">
                      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                        01 Sep, 2026
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview Eye */}
                        <Link
                          href={`/landing/${page.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                          title="Preview Landing Page"
                        >
                          <Eye className="size-4" />
                        </Link>

                        {/* Copy Link */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(page.slug)}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="size-4" />
                        </button>

                        {/* Orders List */}
                        <Link
                          href={`/admin/orders?search=${encodeURIComponent(page.slug)}`}
                          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                          title="View Campaign Orders"
                        >
                          <ShoppingCart className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
