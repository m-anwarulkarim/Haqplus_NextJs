"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  BarChart3,
  TrendingUp,
  RotateCcw,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plug,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Clock,
  AlertTriangle,
  FileText,
  XCircle,
  ArrowRight,
  ListFilter,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  district: string;
  total: number;
  orderStatus: string;
  courierTrackingId?: string | null;
  courierStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCourierHubPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Balance & Credentials State
  const [balance, setBalance] = useState<number | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Live Sync & Steadfast Return Requests State
  const [isSyncing, setIsSyncing] = useState(false);
  const [steadfastReturns, setSteadfastReturns] = useState<any[]>([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);

  // Active Tab State for Detailed Parcel Views
  const [activeDataTab, setActiveDataTab] = useState<"pending" | "today_cancelled" | "latest_returns" | "cancellation_requests">("pending");

  // Instant Search State
  const [statusQuery, setStatusQuery] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);

  // Steadfast Fraud Checker State
  const [fraudPhone, setFraudPhone] = useState("");
  const [isCheckingFraud, setIsCheckingFraud] = useState(false);
  const [fraudResult, setFraudResult] = useState<any>(null);

  const [showAnalytics, setShowAnalytics] = useState(true);

  const handleCheckFraud = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fraudPhone.trim()) {
      toast.error("Please enter a customer phone number");
      return;
    }
    setIsCheckingFraud(true);
    setFraudResult(null);
    try {
      const res = await fetch(`/api/courier/steadfast/fraud-check?phone=${encodeURIComponent(fraudPhone.trim())}`);
      const data = await res.json();
      setFraudResult(data);
      if (res.ok && data.success) {
        toast.success(`Steadfast Fraud Check complete for ${data.phone}`);
      } else {
        toast.error(data.error || "Failed to check fraud record");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error checking Steadfast fraud database");
    } finally {
      setIsCheckingFraud(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courier analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalanceAndSettings = async () => {
    setIsFetchingBalance(true);
    try {
      const res = await fetch("/api/courier/steadfast/balance");
      if (res.ok) {
        const data = await res.json();
        if (data.current_balance !== undefined) {
          setBalance(data.current_balance);
        }
        if (data.message && data.message.includes("Credentials not configured")) {
          setHasApiKey(false);
        } else {
          setHasApiKey(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingBalance(false);
    }
  };

  const fetchSteadfastReturnRequests = async () => {
    setIsLoadingReturns(true);
    try {
      const res = await fetch("/api/courier/steadfast/returns");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSteadfastReturns(data);
        } else if (Array.isArray(data.data)) {
          setSteadfastReturns(data.data);
        } else if (Array.isArray(data.return_requests)) {
          setSteadfastReturns(data.return_requests);
        }
      }
    } catch (err) {
      console.error("Error fetching Steadfast return requests:", err);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const syncLiveSteadfastStatus = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/courier/steadfast/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Steadfast Live Sync complete! Updated ${data.updatedCount || 0} parcels.`);
        await fetchOrders();
        await fetchBalanceAndSettings();
        await fetchSteadfastReturnRequests();
      } else {
        toast.error(data.error || "Live sync failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error syncing with Steadfast server");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBalanceAndSettings();
    fetchSteadfastReturnRequests();
  }, []);

  const handleCheckStatus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!statusQuery.trim()) {
      toast.error("Enter Tracking Code, Invoice, or Consignment ID");
      return;
    }

    setIsCheckingStatus(true);
    setStatusResult(null);
    try {
      const q = statusQuery.trim();
      const res = await fetch(`/api/courier/steadfast/status?trackingCode=${encodeURIComponent(q)}`);
      const data = await res.json();
      setStatusResult(data);
      if (res.ok && data.delivery_status) {
        toast.success(`Steadfast Status: ${data.delivery_status}`);
      } else {
        toast.error(data.error || "Status check failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error checking delivery status");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 1. Compute Pending Parcels (In-Transit or Active Dispatched)
  const pendingParcelsList = orders.filter((o) => {
    const oStatus = (o.orderStatus || "").toUpperCase();
    const cStatus = (o.courierStatus || "").toUpperCase();
    const isDispatched = Boolean(o.courierTrackingId);
    const isNotFinal = oStatus !== "DELIVERED" && oStatus !== "CANCELLED" && oStatus !== "RETURNED";
    return isDispatched && isNotFinal;
  });

  // 2. Compute Today's Cancelled & Returned Parcels
  const todayCancelledParcelsList = orders.filter((o) => {
    const oStatus = (o.orderStatus || "").toUpperCase();
    const cStatus = (o.courierStatus || "").toUpperCase();
    const isCancelledOrReturned = oStatus === "CANCELLED" || oStatus === "RETURNED" || cStatus.includes("CANCELLED") || cStatus.includes("RETURN");
    const isToday = o.updatedAt ? new Date(o.updatedAt).toDateString() === new Date().toDateString() : true;
    return isCancelledOrReturned && isToday;
  });

  // 3. Compute Latest Returned Parcels
  const latestReturnsList = orders.filter((o) => {
    const oStatus = (o.orderStatus || "").toUpperCase();
    const cStatus = (o.courierStatus || "").toUpperCase();
    return oStatus === "RETURNED" || oStatus === "CANCELLED" || cStatus.includes("CANCELLED") || cStatus.includes("RETURN");
  });

  // Compute Overall Courier Performance Stats
  const dispatchedOrders = orders.filter((o) => Boolean(o.courierTrackingId));
  const totalDispatchedCount = dispatchedOrders.length;

  const deliveredOrdersList = orders.filter((o) => {
    const oStatus = (o.orderStatus || "").toUpperCase();
    const cStatus = (o.courierStatus || "").toUpperCase();
    return oStatus === "DELIVERED" || cStatus.includes("DELIVERED");
  });
  const totalDeliveredCount = deliveredOrdersList.length;

  const deliverySuccessPercentage = totalDispatchedCount > 0
    ? ((totalDeliveredCount / totalDispatchedCount) * 100).toFixed(1)
    : "0.0";

  const returnPercentage = totalDispatchedCount > 0
    ? ((latestReturnsList.length / totalDispatchedCount) * 100).toFixed(1)
    : "0.0";

  const totalDeliveredCODAmount = deliveredOrdersList.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalPendingCODAmount = pendingParcelsList.reduce((sum, o) => sum + Number(o.total || 0), 0);

  // Compute District-Wise Delivery vs Return Breakdown
  const districtMap = new Map<string, { total: number; delivered: number; returned: number }>();
  dispatchedOrders.forEach((o) => {
    const dist = (o.district || "Dhaka").trim();
    const current = districtMap.get(dist) || { total: 0, delivered: 0, returned: 0 };
    current.total += 1;
    const oStatus = (o.orderStatus || "").toUpperCase();
    const cStatus = (o.courierStatus || "").toUpperCase();
    if (oStatus === "DELIVERED" || cStatus.includes("DELIVERED")) {
      current.delivered += 1;
    } else if (oStatus === "RETURNED" || cStatus.includes("CANCELLED") || cStatus.includes("RETURN")) {
      current.returned += 1;
    }
    districtMap.set(dist, current);
  });

  const districtAnalyticsList = Array.from(districtMap.entries())
    .map(([district, stats]) => ({
      district,
      total: stats.total,
      delivered: stats.delivered,
      returned: stats.returned,
      successRate: stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(0) : "0",
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-3 py-0.5 text-xs font-bold mb-1">
            <Truck className="size-3.5" />
            <span>Overview Sub-Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Courier Logistics & Live Delivery Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time Steadfast parcel metrics, status sync, return requests & fraud risk checker.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={syncLiveSteadfastStatus}
            disabled={isSyncing}
            variant="outline"
            className="rounded-xl text-xs font-bold gap-2 border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing Live..." : "Sync Steadfast Live Status"}</span>
          </Button>

          <Button asChild className="rounded-xl shadow-xs bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
            <Link href="/admin/orders/conform">
              <PackageCheck className="size-4" />
              <span>Go to Confirmed Orders</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* STEADFAST COURIER LIVE FRAUD CHECKER SEARCH TOOL (TOP PRIORITY) */}
      <Card className="bg-gradient-to-br from-card via-card to-purple-500/5 p-4 sm:p-5 rounded-2xl border border-purple-500/30 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-foreground">Steadfast Courier Live Fraud Checker</h3>
              <p className="text-xs text-muted-foreground">Search any customer phone number to inspect live Steadfast delivery & return history</p>
            </div>
          </div>

          <Badge variant="outline" className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold">
            Official Steadfast API
          </Badge>
        </div>

        <form onSubmit={handleCheckFraud} className="flex gap-2">
          <Input
            placeholder="Enter customer phone number (e.g. 01712345678)"
            value={fraudPhone}
            onChange={(e) => setFraudPhone(e.target.value)}
            className="rounded-xl text-xs font-mono bg-background"
          />
          <Button
            type="submit"
            disabled={isCheckingFraud}
            size="sm"
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 shrink-0 shadow-xs px-5"
          >
            {isCheckingFraud ? <RefreshCw className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
            <span>Fraud Check</span>
          </Button>
        </form>

        {/* Fraud Check Result Display */}
        {fraudResult && (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-muted-foreground">Target Phone: <strong className="text-foreground">{fraudResult.phone}</strong></span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                fraudResult.risk_level === "SAFE"
                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                  : fraudResult.risk_level === "MODERATE"
                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                  : fraudResult.risk_level === "HIGH_RISK"
                  ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                  : "bg-gray-500/15 text-gray-500 border border-gray-500/30"
              }`}>
                {fraudResult.risk_level === "SAFE" ? "🟢 Safe Customer (উচ্চ সাফল্য)" : fraudResult.risk_level === "MODERATE" ? "🟡 Moderate Risk" : fraudResult.risk_level === "HIGH_RISK" ? "🔴 High Return Risk (ঝুঁকিপূর্ণ)" : "⚪ No Prior Steadfast Record"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-card p-2 rounded-lg border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Total Parcels</span>
                <strong className="text-sm text-foreground">{fraudResult.total_parcel}</strong>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">Successful</span>
                <strong className="text-sm text-emerald-600 dark:text-emerald-400">{fraudResult.success_parcel}</strong>
              </div>
              <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 block">Cancelled / Ret</span>
                <strong className="text-sm text-rose-600 dark:text-rose-400">{fraudResult.cancelled_parcel}</strong>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">Steadfast Success Rate:</span>
                <span className="font-bold text-foreground">{fraudResult.success_rate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(fraudResult.success_rate, 100)}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${Math.max(0, 100 - fraudResult.success_rate)}%` }} />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* COURIER API KEY MISSING WARNING BANNER */}
      {!hasApiKey && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>⚠️ Steadfast Courier API Credentials Required</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Please add your Steadfast <strong>Api-Key</strong> and <strong>Secret-Key</strong> in <strong>API Integration Center</strong> to enable live parcel dispatches, status sync, and fraud checks.
              </p>
            </div>
          </div>

          <Button asChild size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 gap-1.5">
            <Link href="/admin/api">
              <span>Go to API Integration</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* 1. REQUIRED REAL-TIME COURIER PARCEL METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Pending Parcel */}
        <Card
          onClick={() => setActiveDataTab("pending")}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-xs ${
            activeDataTab === "pending"
              ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5"
              : "border-border/80 hover:border-blue-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Parcel</span>
            <div className="size-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {pendingParcelsList.length} <span className="text-xs font-normal text-muted-foreground">Parcels</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between font-mono">
              <span>In-Transit COD:</span>
              <strong className="text-foreground">৳{totalPendingCODAmount.toLocaleString()}</strong>
            </p>
          </div>
        </Card>

        {/* 2. Today's Cancelled */}
        <Card
          onClick={() => setActiveDataTab("today_cancelled")}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-xs ${
            activeDataTab === "today_cancelled"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5"
              : "border-border/80 hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Cancelled</span>
            <div className="size-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <XCircle className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {todayCancelledParcelsList.length} <span className="text-xs font-normal text-muted-foreground">Today</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-mono">
              Cancelled / returned in last 24h
            </p>
          </div>
        </Card>

        {/* 3. Latest Return */}
        <Card
          onClick={() => setActiveDataTab("latest_returns")}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-xs ${
            activeDataTab === "latest_returns"
              ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5"
              : "border-border/80 hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Latest Return</span>
            <div className="size-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <RotateCcw className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {latestReturnsList.length} <span className="text-xs font-normal text-muted-foreground">Total</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between font-mono">
              <span>Return Rate:</span>
              <strong className={Number(returnPercentage) > 20 ? "text-rose-500" : "text-emerald-500"}>
                {returnPercentage}%
              </strong>
            </p>
          </div>
        </Card>

        {/* 4. Cancellation Requests */}
        <Card
          onClick={() => setActiveDataTab("cancellation_requests")}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-xs ${
            activeDataTab === "cancellation_requests"
              ? "border-purple-500 ring-2 ring-purple-500/20 bg-purple-500/5"
              : "border-border/80 hover:border-purple-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cancellation Requests</span>
            <div className="size-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {steadfastReturns.length} <span className="text-xs font-normal text-muted-foreground">Requests</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between font-mono">
              <span>Steadfast Live API:</span>
              <a
                href="https://steadfast.com.bd/user/consignment/cancel-requests/show/0"
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 dark:text-purple-300 font-bold hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
                title="Open Steadfast Portal Return Requests"
              >
                <span>Steadfast Portal</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. COURIER PERFORMANCE & RETURN ANALYTICS DASHBOARD */}
      <Card className="rounded-2xl border-border/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-foreground flex items-center gap-2">
                <span>Courier Performance & Return Analytics Report</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Dispatched consignments, delivery success rate, return analytics & pending COD payouts
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            {showAnalytics ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            <span>{showAnalytics ? "Minimize" : "Expand Analytics"}</span>
          </Button>
        </div>

        {showAnalytics && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top 4 KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. Delivery Success Rate */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-card to-card p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Delivery Success Rate</span>
                  <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="size-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {deliverySuccessPercentage}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(Number(deliverySuccessPercentage), 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center justify-between font-mono">
                    <span>Delivered: <strong>{totalDeliveredCount}</strong></span>
                    <span>Total Sent: <strong>{totalDispatchedCount}</strong></span>
                  </p>
                </div>
              </div>

              {/* 2. Return & Cancel Rate */}
              <div className="bg-gradient-to-br from-rose-500/10 via-card to-card p-4 rounded-xl border border-rose-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Return & Cancel Rate</span>
                  <div className="size-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <RotateCcw className="size-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
                    {returnPercentage}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(Number(returnPercentage), 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center justify-between font-mono">
                    <span>Returned: <strong>{latestReturnsList.length}</strong></span>
                    <span>Risk: <strong className={Number(returnPercentage) > 20 ? "text-rose-500" : "text-emerald-500"}>{Number(returnPercentage) > 20 ? "High" : "Normal"}</strong></span>
                  </p>
                </div>
              </div>

              {/* 3. In-Transit Active Shipments */}
              <div className="bg-gradient-to-br from-blue-500/10 via-card to-card p-4 rounded-xl border border-blue-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Active In-Transit</span>
                  <div className="size-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Truck className="size-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {pendingParcelsList.length} <span className="text-xs font-normal text-muted-foreground">Parcels</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                    Pending COD: <strong className="text-foreground">৳{totalPendingCODAmount.toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              {/* 4. Total Delivered COD Cash */}
              <div className="bg-gradient-to-br from-purple-500/10 via-card to-card p-4 rounded-xl border border-purple-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Delivered Cash Value</span>
                  <div className="size-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Wallet className="size-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                    ৳{totalDeliveredCODAmount.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Collected from delivered orders
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Top District-wise Delivery Rate Breakdown */}
            {districtAnalyticsList.length > 0 && (
              <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-purple-500" />
                    <span>Top Districts Delivery Performance & Return Risk</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">Based on dispatched orders</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 font-mono text-xs">
                  {districtAnalyticsList.map((dist) => (
                    <div key={dist.district} className="bg-card p-2.5 rounded-lg border border-border/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground truncate max-w-[90px]">{dist.district}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300">
                          {dist.successRate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Sent: <strong>{dist.total}</strong></span>
                        <span className="text-rose-500">Ret: <strong>{dist.returned}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 5. INSTANT STEADFAST STATUS LOOKUP & MERCHANT BALANCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Account Balance Card */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Wallet className="size-5" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Steadfast Payout Balance</span>
            </div>
            <button
              onClick={fetchBalanceAndSettings}
              disabled={isFetchingBalance}
              className="text-muted-foreground hover:text-foreground"
              title="Refresh Balance"
            >
              <RefreshCw className={`size-3.5 ${isFetchingBalance ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ৳{balance !== null ? balance.toLocaleString() : "..."}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live account balance from Steadfast API
            </p>
          </div>
        </Card>

        {/* Instant Status Check Form */}
        <Card className="md:col-span-2 p-4 rounded-2xl border-border/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">Instant Steadfast Parcel Status Lookup</span>
            <span className="text-[11px] text-muted-foreground">Check real-time status by Tracking Code or Invoice</span>
          </div>

          <form onSubmit={handleCheckStatus} className="flex gap-2">
            <Input
              placeholder="Enter tracking code (e.g. STF-849201) or Invoice #"
              value={statusQuery}
              onChange={(e) => setStatusQuery(e.target.value)}
              className="rounded-xl text-xs font-mono"
            />
            <Button
              type="submit"
              disabled={isCheckingStatus}
              size="sm"
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shrink-0"
            >
              {isCheckingStatus ? <RefreshCw className="size-3.5 animate-spin" /> : "Check Status"}
            </Button>
          </form>

          {statusResult && (
            <div className="mt-2.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between">
              <span className="text-muted-foreground font-medium">QueryResult:</span>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-bold">
                {statusResult.delivery_status || "Unknown"}
              </Badge>
            </div>
          )}
        </Card>
      </div>

      {/* 6. API INTEGRATION & WEBHOOK QUICK STATUS CARD */}
      <Card className="border-border/80 p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <Plug className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">
              Steadfast API Key & Webhook Status
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Configure Callback URL, Auth Token (Bearer), and API keys in Admin API Integration Center.
            </p>
          </div>
        </div>

        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 shrink-0">
          <Link href="/admin/api">
            <span>Manage API & Webhook Setup</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
