"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  RefreshCw,
  Search,
  PackageCheck,
  Eye,
  Edit,
  Printer,
  Package,
  RotateCcw,
  XCircle,
  HelpCircle,
  AlertCircle,
  Sparkles,
  X,
  ChevronDown,
  Globe,
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
import { detectThanaFromAddress, BANGLADESH_THANAS_DICT } from "@/lib/courier/thana-resolver";

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

// POST-CONFIRM COURIER TABS MATCHING USER SPECIFICATIONS
const CONFORM_TABS = [
  { id: "CONFIRMED", label: "Confirmed", icon: Package, color: "text-blue-600" },
  { id: "PRINTED", label: "Printed", icon: Printer, color: "text-purple-600" },
  { id: "ENTRY_DONE", label: "Entry Done", icon: PackageCheck, color: "text-cyan-600" },
  { id: "SHIPPED", label: "Shipped", icon: Truck, color: "text-amber-600" },
  { id: "DELIVERED", label: "Delivered", icon: CheckCircle2, color: "text-emerald-600" },
  { id: "PARTIAL", label: "Partial", icon: Package, color: "text-indigo-600" },
  { id: "PENDING_RETURN", label: "Pending Return", icon: AlertCircle, color: "text-orange-600" },
  { id: "RETURN", label: "Return", icon: RotateCcw, color: "text-rose-600" },
  { id: "CANCEL", label: "Cancel", icon: XCircle, color: "text-rose-600" },
  { id: "MISSING", label: "Missing", icon: HelpCircle, color: "text-gray-500" },
  { id: "ALL", label: "All", icon: Sparkles, color: "text-primary" },
];

export default function AdminOrdersConformPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState("CONFIRMED");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("ALL");
  const [manualThanaMap, setManualThanaMap] = useState<Record<string, string>>({});

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
      toast.error("Failed to load confirmed orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Compute status counts for tabs
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

  // Dispatch to Steadfast Courier with Thana Check & Alerts
  const handleCourierEntry = async (targetIds?: string[]) => {
    const idsToProcess = Array.isArray(targetIds) ? targetIds : selectedIds;
    if (!idsToProcess || idsToProcess.length === 0) {
      toast.error("Please select at least one order to enter into courier");
      return;
    }

    // Alert Check: Ensure all selected orders have a detected or manual Thana
    const unmappedOrders = orders.filter((o) => {
      if (!idsToProcess.includes(o.id)) return false;
      const res = detectThanaFromAddress(o.address, o.district);
      const hasManual = Boolean(manualThanaMap[o.id]);
      return res.confidence === "NONE" && !hasManual;
    });

    if (unmappedOrders.length > 0) {
      toast.error(
        `⚠️ সতর্কতা (${unmappedOrders.length} টি অর্ডার): ঠিকানা থেকে থানা অটো-ডিটেক্ট করা যায়নি! কুরিয়ারে সঠিক ডেলিভারির জন্য ম্যানুয়ালি ড্রপডাউন থেকে থানা নির্বাচন করুন।`
      );
    }

    setIsDispatching(true);
    try {
      const res = await fetch("/api/courier/steadfast/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: idsToProcess, selectedThanas: manualThanaMap }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Courier entry failed");
        return;
      }

      if (data.successCount === 0) {
        const errorMsg =
          data.processed?.[0]?.error ||
          "Steadfast Courier API check failed. Please verify API credentials.";
        toast.error(`Entry Failed: ${errorMsg}`);
        return;
      }

      toast.success(`Entered ${data.successCount} orders into Steadfast Courier!`);
      setSelectedIds([]);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Network error during courier entry");
    } finally {
      setIsDispatching(false);
    }
  };

  // Dispatch to Pathao Courier
  const handlePathaoCourierEntry = async (targetIds?: string[]) => {
    const idsToProcess = Array.isArray(targetIds) ? targetIds : selectedIds;
    if (!idsToProcess || idsToProcess.length === 0) {
      toast.error("Please select at least one order to enter into Pathao Courier");
      return;
    }

    setIsDispatching(true);
    try {
      const res = await fetch("/api/courier/pathao/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: idsToProcess }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Pathao courier entry failed");
        return;
      }

      if (data.successCount === 0) {
        const errorMsg =
          data.processed?.[0]?.error ||
          "Pathao Courier API check failed. Please verify Pathao credentials in /admin/api.";
        toast.error(`Entry Failed: ${errorMsg}`);
        return;
      }

      toast.success(`Entered ${data.successCount} orders into Pathao Courier!`);
      setSelectedIds([]);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Network error during Pathao courier entry");
    } finally {
      setIsDispatching(false);
    }
  };

  // Mark selected orders as Printed
  const handleMarkPrinted = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select orders to mark as printed");
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/orders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courierStatus: "printed" }),
          })
        )
      );
      toast.success(`Marked ${selectedIds.length} orders as Printed!`);
      setSelectedIds([]);
      fetchOrders();
    } catch {
      toast.error("Failed to mark orders as printed");
    }
  };

  // Filtered orders matching tabs & search
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

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins || 1} minute${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP TABS WITH CLEAN THEME */}
      <div className="bg-card border border-border/80 p-2.5 sm:p-3.5 rounded-2xl shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {CONFORM_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = getTabCount(tab.id);
            const isActive = selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/40 shadow-2xs"
                    : "bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                <Icon className={`size-3.5 ${tab.color}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span className="font-mono text-[11px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTION & FILTER TOOLBAR WITH CLEAN THEME */}
      <div className="bg-card border border-border/80 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Left Inputs: Search & Invoice Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Order ID, name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl bg-background border-border text-xs font-medium text-foreground placeholder:text-muted-foreground h-9"
            />
          </div>

          <div className="relative">
            <select
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value)}
              className="rounded-xl bg-background border border-border text-xs font-semibold text-foreground h-9 px-3.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-primary"
            >
              <option value="ALL">All invoices ({filteredOrders.length})</option>
              <option value="CONFIRMED">Confirmed only</option>
              <option value="DISPATCHED">Dispatched only</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end text-xs">
          <span className="text-muted-foreground font-mono text-xs mr-1">
            {selectedIds.length} selected
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const target = orders.find((o) => selectedIds.includes(o.id)) || filteredOrders[0];
              if (target) setPrintOrder(target);
              else toast.error("Select an order to print");
            }}
            className="rounded-xl border-border/80 font-bold gap-1.5 h-9"
          >
            <Printer className="size-3.5 text-purple-600" />
            <span>Print</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleCourierEntry()}
            disabled={isDispatching}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 h-9 shadow-xs"
          >
            {isDispatching ? <RefreshCw className="size-3.5 animate-spin" /> : <PackageCheck className="size-3.5" />}
            <span>Steadfast Entry</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handlePathaoCourierEntry()}
            disabled={isDispatching}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 h-9 shadow-xs"
          >
            {isDispatching ? <RefreshCw className="size-3.5 animate-spin" /> : <Truck className="size-3.5" />}
            <span>Pathao Entry</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkPrinted}
            className="rounded-xl border-purple-500/30 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 font-bold gap-1.5 h-9"
          >
            <RefreshCw className="size-3.5" />
            <span>Printed</span>
          </Button>
        </div>
      </div>

      {/* 3. ORDER DATA TABLE WITH CLEAN LIGHT/MODERN THEME */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/80 text-muted-foreground text-xs">
                <TableHead className="w-[40px] text-center">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                </TableHead>
                <TableHead className="font-bold text-foreground">Confirmed</TableHead>
                <TableHead className="font-bold text-foreground">Order</TableHead>
                <TableHead className="font-bold text-foreground">Customer</TableHead>
                <TableHead className="font-bold text-foreground">Number</TableHead>
                <TableHead className="font-bold text-foreground">Thana / Zone (Auto-Match)</TableHead>
                <TableHead className="font-bold text-foreground">Products</TableHead>
                <TableHead className="font-bold text-foreground">Source</TableHead>
                <TableHead className="font-bold text-foreground">Total</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-primary" />
                      <span className="text-sm">Loading confirmed orders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="size-8 text-emerald-500" />
                      <p className="text-sm font-semibold text-foreground">No orders in this status</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const firstItem = order.items?.[0];

                  return (
                    <TableRow
                      key={order.id}
                      className={`hover:bg-muted/30 border-b border-border/60 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(order.id)}
                          className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                      </TableCell>

                      {/* Confirmed Date */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {getTimeAgo(order.createdAt)}
                      </TableCell>

                      {/* Order Number */}
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-sm text-primary hover:underline block"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>

                      {/* Customer Info */}
                      <TableCell>
                        <p className="font-bold text-xs text-foreground">{order.customerName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">@{order.customerName.toLowerCase().replace(/\s+/g, "")}</p>
                      </TableCell>

                      {/* Phone Number */}
                      <TableCell className="font-mono text-xs text-foreground">
                        {order.phone}
                      </TableCell>

                      {/* Thana Auto-Match Column with Alert Indicator */}
                      <TableCell className="min-w-[150px]">
                        {(() => {
                          const thanaRes = detectThanaFromAddress(order.address, order.district);
                          const effectiveThana = thanaRes.matchedThana;

                          if (effectiveThana) {
                            return (
                              <div className="space-y-0.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  thanaRes.confidence === "EXACT"
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                    : "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                                }`}>
                                  <CheckCircle2 className="size-3" />
                                  <span>{effectiveThana}</span>
                                </span>
                                <span className="block text-[10px] text-muted-foreground font-mono">
                                  {thanaRes.confidence} Auto-Match
                                </span>
                              </div>
                            );
                          }

                          // ALERT STATE: NOT DETECTED - LINK TO DETAILS PAGE
                          return (
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-500/15 text-rose-600 border border-rose-500/40 hover:bg-rose-500/25 transition animate-pulse"
                              title="Click to open order details & select Thana"
                            >
                              <AlertCircle className="size-3.5 text-rose-600 shrink-0" />
                              <span>⚠️ থানা মিসিং (Alert)</span>
                            </Link>
                          );
                        })()}
                      </TableCell>

                      {/* Products Thumbnail */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <img
                            src={
                              firstItem?.product?.images?.[0] ||
                              firstItem?.image ||
                              "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80"
                            }
                            alt="Product"
                            className="size-9 rounded-lg object-cover border border-border/80 shrink-0"
                          />
                        </div>
                      </TableCell>

                      {/* Source */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          <Globe className="size-3" />
                          <span>Direct</span>
                        </span>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="font-mono text-sm font-black text-foreground whitespace-nowrap">
                        ৳{order.total}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {order.courierStatus || order.orderStatus}
                        </span>
                      </TableCell>

                      {/* Tag */}
                      <TableCell className="text-xs text-muted-foreground italic">
                        -
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition"
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10 transition"
                            title="Edit Order"
                          >
                            <Edit className="size-4" />
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
      </div>

      {/* PRINT INVOICE MODAL */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Printer className="size-5 text-purple-600" />
                <span>Invoice Print Preview (#{printOrder.orderNumber})</span>
              </h3>
              <button
                onClick={() => setPrintOrder(null)}
                className="size-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
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
                courierTrackingId: printOrder.courierTrackingId || null,
                createdAt: printOrder.createdAt || new Date().toISOString(),
                items: printOrder.items || [],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
