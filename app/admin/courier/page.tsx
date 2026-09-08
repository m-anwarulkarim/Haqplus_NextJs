"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  RefreshCw,
  Search,
  GripVertical,
  PackageCheck,
  Eye,
  Wallet,
  ShieldAlert,
  Printer,
  Package,
  RotateCcw,
  XCircle,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { InvoiceView } from "@/components/admin/invoice-view";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string | null;
  district: string;
  division: string;
  address: string;
  area: string;
  subtotal?: number;
  discount?: number;
  shippingCharge?: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  orderStatus: string;
  courierTrackingId?: string | null;
  courierStatus?: string | null;
  createdAt?: string;
  items?: any[];
}

// Post-Confirm / Courier Real Update Tabs matching Image 2
const COURIER_TABS = [
  { id: "CONFIRMED", label: "Confirmed", icon: Package, color: "text-blue-400" },
  { id: "PRINTED", label: "Printed", icon: Printer, color: "text-purple-400" },
  { id: "ENTRY_DONE", label: "Entry Done", icon: PackageCheck, color: "text-cyan-400" },
  { id: "SHIPPED", label: "Shipped", icon: Truck, color: "text-amber-400" },
  { id: "DELIVERED", label: "Delivered", icon: CheckCircle2, color: "text-emerald-400" },
  { id: "PARTIAL", label: "Partial", icon: Package, color: "text-indigo-400" },
  { id: "PENDING_RETURN", label: "Pending Return", icon: AlertCircle, color: "text-orange-400" },
  { id: "RETURN", label: "Return", icon: RotateCcw, color: "text-rose-400" },
  { id: "CANCEL", label: "Cancel", icon: XCircle, color: "text-rose-500" },
  { id: "MISSING", label: "Missing", icon: HelpCircle, color: "text-gray-400" },
  { id: "ALL", label: "All", icon: Sparkles, color: "text-[#CBB8DB]" },
];

export default function AdminCourierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState("CONFIRMED");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Balance & Credentials State
  const [balance, setBalance] = useState<number | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Instant Search State
  const [statusQuery, setStatusQuery] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);

  // Print Modal State
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

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
      toast.error("Failed to load orders for courier management");
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

  useEffect(() => {
    fetchOrders();
    fetchBalanceAndSettings();
  }, []);

  // Compute status counts for courier tabs
  const getTabCount = (tabId: string) => {
    if (tabId === "ALL") return orders.length;

    return orders.filter((o) => {
      const oStatus = (o.orderStatus || "").toUpperCase();
      const cStatus = (o.courierStatus || "").toUpperCase();

      switch (tabId) {
        case "CONFIRMED":
          return oStatus === "CONFIRMED" && !o.courierTrackingId;
        case "PRINTED":
          return cStatus === "PRINTED" || oStatus === "PRINTED";
        case "ENTRY_DONE":
          return cStatus === "IN_REVIEW" || cStatus === "PENDING" || Boolean(o.courierTrackingId && !cStatus);
        case "SHIPPED":
          return oStatus === "SHIPPED" || cStatus.includes("TRANSIT") || cStatus.includes("OUT");
        case "DELIVERED":
          return oStatus === "DELIVERED" || cStatus.includes("DELIVERED");
        case "PARTIAL":
          return cStatus.includes("PARTIAL") || oStatus === "PARTIAL_DELIVERED";
        case "PENDING_RETURN":
          return cStatus.includes("CANCELLED_APPROVAL_PENDING") || cStatus.includes("PENDING_RETURN");
        case "RETURN":
          return oStatus === "RETURNED" || cStatus.includes("CANCELLED") || cStatus.includes("RETURN");
        case "CANCEL":
          return oStatus === "CANCELLED";
        case "MISSING":
          return cStatus.includes("UNKNOWN") || cStatus.includes("MISSING");
        default:
          return false;
      }
    }).length;
  };

  // Sync real delivery status from Steadfast API
  const handleSyncCourierStatuses = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/courier/steadfast/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to sync courier statuses");
        if (data.isSimulated) {
          setHasApiKey(false);
        }
        return;
      }
      toast.success(
        `Successfully synced ${data.updatedCount} orders with Steadfast!`
      );
      fetchOrders();
      fetchBalanceAndSettings();
    } catch (err) {
      console.error(err);
      toast.error("Network error syncing courier statuses");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Courier Entry Action
  const handleCourierEntry = async (targetIds?: string[] | React.SyntheticEvent) => {
    const idsToProcess = Array.isArray(targetIds) ? targetIds : selectedIds;
    if (!idsToProcess || idsToProcess.length === 0) {
      toast.error("Please select at least one order to enter into courier");
      return;
    }

    setIsDispatching(true);
    try {
      const res = await fetch("/api/courier/steadfast/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: idsToProcess }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Courier entry failed");
        return;
      }

      if (data.successCount === 0) {
        const errorMsg =
          data.processed?.[0]?.error ||
          "Steadfast Courier API check failed. Please verify API Key & Secret Key in Admin API Integration.";
        toast.error(`Entry Failed: ${errorMsg}`);
        return;
      }

      toast.success(
        `Entered ${data.successCount} of ${data.total} orders into Steadfast Courier!`
      );
      setSelectedIds([]);
      fetchOrders();
      fetchBalanceAndSettings();
    } catch (err) {
      console.error(err);
      toast.error("Network error during courier entry");
    } finally {
      setIsDispatching(false);
    }
  };

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

  // Filtered orders by tab and search
  const filteredOrders = orders.filter((order) => {
    const oStatus = (order.orderStatus || "").toUpperCase();
    const cStatus = (order.courierStatus || "").toUpperCase();

    let tabMatch = true;
    switch (selectedTab) {
      case "CONFIRMED":
        tabMatch = oStatus === "CONFIRMED" && !order.courierTrackingId;
        break;
      case "PRINTED":
        tabMatch = cStatus === "PRINTED" || oStatus === "PRINTED";
        break;
      case "ENTRY_DONE":
        tabMatch = cStatus === "IN_REVIEW" || cStatus === "PENDING" || Boolean(order.courierTrackingId && !cStatus);
        break;
      case "SHIPPED":
        tabMatch = oStatus === "SHIPPED" || cStatus.includes("TRANSIT") || cStatus.includes("OUT");
        break;
      case "DELIVERED":
        tabMatch = oStatus === "DELIVERED" || cStatus.includes("DELIVERED");
        break;
      case "PARTIAL":
        tabMatch = cStatus.includes("PARTIAL") || oStatus === "PARTIAL_DELIVERED";
        break;
      case "PENDING_RETURN":
        tabMatch = cStatus.includes("CANCELLED_APPROVAL_PENDING") || cStatus.includes("PENDING_RETURN");
        break;
      case "RETURN":
        tabMatch = oStatus === "RETURNED" || cStatus.includes("CANCELLED") || cStatus.includes("RETURN");
        break;
      case "CANCEL":
        tabMatch = oStatus === "CANCELLED";
        break;
      case "MISSING":
        tabMatch = cStatus.includes("UNKNOWN") || cStatus.includes("MISSING");
        break;
      case "ALL":
      default:
        tabMatch = true;
        break;
    }

    if (!tabMatch) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.phone.toLowerCase().includes(q) ||
      order.district.toLowerCase().includes(q) ||
      (order.courierTrackingId && order.courierTrackingId.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status?: string | null) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          Delivered (ডেলিভারড)
        </span>
      );
    }
    if (s.includes("cancel") || s.includes("return")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          Cancelled / Return
        </span>
      );
    }
    if (s.includes("transit") || s.includes("out")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          In Transit (পথে আছে)
        </span>
      );
    }
    if (s.includes("hold")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          On Hold (হোল্ড)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
        {s || "Entry Done / In Review"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-3 py-0.5 text-xs font-bold mb-1">
            <Truck className="size-3.5" />
            <span>Courier Real Update (পোস্ট-কনফার্ম)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Courier Status & Shipment Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track real-time Steadfast courier updates, print invoices, and send confirmed consignments to courier.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncCourierStatuses}
            disabled={isSyncing}
            className="rounded-xl gap-1.5 border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 font-bold"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync Steadfast Real Statuses</span>
          </Button>

          <Button
            onClick={() => handleCourierEntry()}
            disabled={selectedIds.length === 0 || isDispatching}
            className="rounded-xl shadow-xs gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {isDispatching ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <PackageCheck className="size-4" />
            )}
            <span>📦 Courier Entry ({selectedIds.length})</span>
          </Button>
        </div>
      </div>

      {/* COURIER API KEY MISSING WARNING BANNER */}
      {!hasApiKey && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>⚠️ Steadfast Courier API Key যুক্ত করা হয়নি!</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                আপনি যে কুরিয়ার ডিসপ্যাচ করছেন তা ডেমো মোডে ট্র্যাকিং আইডি জেনারেট করছে। আপনার Steadfast অ্যাকাউন্টে আসল পার্সেল পাঠাতে ও লাইভ ট্র্যাকিং আপডেট পেতে **API Integration Center** এ গিয়ে আপনার <strong>Api-Key</strong> এবং <strong>Secret-Key</strong> সেভ করুন।
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

      {/* IMAGE 2: POST-CONFIRM COURIER RESPONSIVE TABS */}
      <div className="bg-card border border-border/80 p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {COURIER_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = getTabCount(tab.id);
            const isActive = selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#CBB8DB]/25 text-[#7C5A9C] dark:text-[#CBB8DB] border border-[#CBB8DB]/60 shadow-xs scale-102"
                    : "bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className={`size-3.5 ${tab.color}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] font-mono font-black ${
                    isActive
                      ? "bg-[#CBB8DB]/40 text-[#7C5A9C] dark:text-[#CBB8DB]"
                      : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTION ACTION BAR (PRINT & COURIER ENTRY BUTTONS) */}
      {(selectedIds.length > 0 || selectedTab === "CONFIRMED") && (
        <div className="bg-gradient-to-r from-purple-600/15 via-blue-600/15 to-emerald-600/15 border border-purple-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold font-mono">
              {selectedIds.length > 0 ? `${selectedIds.length} Selected` : "Confirmed Orders"}
            </span>
            <span className="text-foreground font-semibold">
              কুরিয়ারে এন্ট্রি অথবা প্রিন্ট চালান করার অপশন:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Option 1: Print Invoice */}
            <Button
              onClick={() => {
                const targetOrder = orders.find((o) => selectedIds.includes(o.id)) || filteredOrders[0];
                if (targetOrder) setPrintOrder(targetOrder);
                else toast.error("Select an order to print invoice");
              }}
              className="w-full sm:w-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <Printer className="size-4" />
              <span>🖨️ Print Invoice (প্রিন্ট)</span>
            </Button>

            {/* Option 2: Courier Entry */}
            <Button
              onClick={handleCourierEntry}
              disabled={isDispatching || (selectedIds.length === 0 && selectedTab !== "CONFIRMED")}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              {isDispatching ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <PackageCheck className="size-4" />
              )}
              <span>📦 Courier Entry (কুরিয়ার এন্ট্রি)</span>
            </Button>
          </div>
        </div>
      )}

      {/* Top Banner Cards: Merchant Balance + Live Status Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Merchant Balance Card */}
        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Wallet className="size-5" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Steadfast Account Balance</span>
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
              Current payouts balance from Steadfast
            </p>
          </div>
        </div>

        {/* Search & Instant Status Check Card */}
        <div className="md:col-span-2 bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">Instant Steadfast Status Lookup</span>
            <span className="text-[11px] text-muted-foreground">Check status by Tracking Code or Invoice</span>
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
              {getStatusBadge(statusResult.delivery_status)}
            </div>
          )}
        </div>
      </div>

      {/* Filter Search Input */}
      <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Filter orders by customer name, order #, phone, district, or tracking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-[40px] text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all orders"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedIds.length === filteredOrders.length
                    }
                    onChange={handleSelectAll}
                    className="size-4 rounded border-gray-400 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="w-[50px] text-center font-bold">#</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>COD Amount</TableHead>
                <TableHead>Courier Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-purple-500" />
                      <span className="text-sm font-medium">Scanning courier shipments...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="size-8 text-emerald-500" />
                      <p className="text-sm font-semibold text-foreground">No orders in this status category</p>
                      <p className="text-xs text-muted-foreground">
                        Try selecting another tab or clearing search filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => {
                  const isSelected = selectedIds.includes(order.id);

                  return (
                    <TableRow
                      key={order.id}
                      className={`hover:bg-muted/40 transition-colors border-b border-border/40 ${
                        isSelected ? "bg-purple-500/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select order ${order.orderNumber}`}
                          checked={isSelected}
                          onChange={() => handleSelectOne(order.id)}
                          className="size-4 rounded border-gray-400 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </TableCell>

                      {/* Index */}
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* Order Number */}
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-sm text-foreground hover:text-purple-500 transition-colors block"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>

                      {/* Customer Info */}
                      <TableCell>
                        <p className="font-semibold text-sm text-foreground">{order.customerName}</p>
                        <p className="text-xs font-mono text-muted-foreground">{order.phone}</p>
                      </TableCell>

                      {/* Tracking ID */}
                      <TableCell>
                        {order.courierTrackingId ? (
                          <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                            {order.courierTrackingId}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not Dispatched</span>
                        )}
                      </TableCell>

                      {/* COD Amount */}
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                          ৳{order.total}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {order.paymentMethod}
                        </span>
                      </TableCell>

                      {/* Courier Status */}
                      <TableCell>{getStatusBadge(order.courierStatus || order.orderStatus)}</TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Option 1: Print Invoice */}
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="size-4" />
                          </button>

                          {/* Option 2: Courier Entry */}
                          {!order.courierTrackingId && (
                            <Button
                              size="sm"
                              onClick={() => handleCourierEntry([order.id])}
                              className="rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-2.5"
                            >
                              <PackageCheck className="size-3" />
                              <span>Entry</span>
                            </Button>
                          )}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing <strong className="text-foreground">{filteredOrders.length}</strong> orders
          </span>
          <span>Steadfast API Endpoint: portal.packzy.com/api/v1</span>
        </div>
      </div>

      {/* PRINT INVOICE MODAL */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Printer className="size-5 text-purple-500" />
                <span>Invoice Print Preview (#{printOrder.orderNumber})</span>
              </h3>
              <button
                onClick={() => setPrintOrder(null)}
                className="size-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <InvoiceView
              order={{
                id: printOrder.id,
                orderNumber: printOrder.orderNumber,
                customerName: printOrder.customerName,
                phone: printOrder.phone,
                email: printOrder.email || null,
                division: printOrder.division || "Dhaka",
                district: printOrder.district || "Dhaka",
                area: printOrder.area || "Inside BD",
                address: printOrder.address,
                subtotal: printOrder.subtotal || printOrder.total,
                discount: printOrder.discount || 0,
                shippingCharge: printOrder.shippingCharge || 60,
                total: printOrder.total,
                paymentMethod: printOrder.paymentMethod,
                paymentStatus: printOrder.paymentStatus || "PENDING",
                orderStatus: printOrder.orderStatus,
                courierTrackingId: printOrder.courierTrackingId,
                createdAt: printOrder.createdAt || new Date().toISOString(),
                items: (printOrder.items || []).map((it: any) => ({
                  id: it.id || "it_1",
                  productName: it.productName || it.name || "Tea Product",
                  quantity: it.quantity || 1,
                  price: it.price || 0,
                })),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
