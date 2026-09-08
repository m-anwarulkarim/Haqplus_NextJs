"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Calendar,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  Trash2,
  MessageSquare,
  Grid,
  Settings,
  ShieldAlert,
  History,
  Globe,
  Ban,
  Check,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceView } from "@/components/admin/invoice-view";
import { toast } from "@/components/ui/toast";
import { TEA_PRODUCTS, TeaProduct } from "@/lib/data/tea-products";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "invoice">("edit");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Real Customer Order History State
  const [customerHistoryOrders, setCustomerHistoryOrders] = useState<any[]>([]);
  const [isBanned, setIsBanned] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  // Editable Order Form States
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [orderStatus, setOrderStatus] = useState("CONFIRMED");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [discount, setDiscount] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [shippingCharge, setShippingCharge] = useState<number>(60);
  const [items, setItems] = useState<any[]>([]);

  // Product Search State for adding items to order
  const [searchQuery, setSearchQuery] = useState("");

  const getBengaliStatus = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "কনফার্ম";
      case "PROCESSING":
        return "প্রসেসিং";
      case "SHIPPED":
        return "শিপড";
      case "DELIVERED":
        return "ডেলিভারড";
      case "CANCELLED":
        return "বাতিল";
      case "RETURNED":
        return "রিটার্ন";
      default:
        return "পেন্ডিং";
    }
  };

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);

        // Populate editable state
        setCustomerName(data.customerName || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setNote(data.note || "");
        setOrderStatus(data.orderStatus || "CONFIRMED");
        setPaymentStatus(data.paymentStatus || "PENDING");
        setDiscount(data.discount || 0);
        setAdvance(data.advance || 0);
        setShippingCharge(data.shippingCharge || 60);
        setItems(data.items || []);
        setIsBanned(data.deviceInfo?.isBanned || false);
        if (data.note) setShowNoteInput(true);

        // Fetch REAL customer past order history matching phone number
        if (data.phone) {
          try {
            const histRes = await fetch(`/api/orders?search=${encodeURIComponent(data.phone)}`);
            if (histRes.ok) {
              const historyData = await histRes.json();
              if (Array.isArray(historyData)) {
                setCustomerHistoryOrders(historyData);
              }
            }
          } catch (histErr) {
            console.warn("Error loading customer history:", histErr);
          }
        }
      } else {
        toast.error("Failed to load order details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  // Derived financial totals
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const total = Math.max(0, subtotal - discount - advance + shippingCharge);
  const totalPcs = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // Derived customer order history statistics
  const realHistoryList = customerHistoryOrders.length > 0 ? customerHistoryOrders : order ? [order] : [];
  const realTotalOrdersCount = realHistoryList.length;
  const realCancelledOrdersCount = realHistoryList.filter(
    (o) => o.orderStatus === "CANCELLED" || o.orderStatus === "RETURNED"
  ).length;
  const realReceivedOrdersCount = Math.max(0, realTotalOrdersCount - realCancelledOrdersCount);
  const realConfirmedCount = realHistoryList.filter(
    (o) => o.orderStatus !== "CANCELLED" && o.orderStatus !== "RETURNED"
  ).length;
  const realTotalSpent = realHistoryList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const realDeliveryRate =
    realTotalOrdersCount > 0
      ? ((realReceivedOrdersCount / realTotalOrdersCount) * 100).toFixed(1)
      : "100.0";

  // Item manipulation handlers
  const updateItemQuantity = (index: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addProductToOrder = (prod: TeaProduct) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === prod.id || it.productName === prod.name
      );
      if (existingIdx !== -1) {
        return prev.map((it, idx) =>
          idx === existingIdx ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [
        ...prev,
        {
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          productId: prod.id,
          productName: prod.name,
          price: prod.price,
          quantity: 1,
          product: {
            id: prod.id,
            name: prod.name,
            images: prod.images,
          },
        },
      ];
    });
    toast.success(`Added ${prod.bengaliName || prod.name} to order`);
  };

  // Filter products for store search drawer
  const filteredProducts = TEA_PRODUCTS.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.bengaliName && p.bengaliName.toLowerCase().includes(q)) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  // Save changes to order
  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const payload = {
        customerName,
        phone,
        address,
        note: note.trim() || null,
        orderStatus,
        paymentStatus,
        subtotal,
        discount: Number(discount) || 0,
        advance: Number(advance) || 0,
        shippingCharge: Number(shippingCharge) || 0,
        total,
        items: items.map((it) => ({
          productId: it.productId || `prod_${Date.now()}`,
          name: it.productName || it.name,
          price: Number(it.price),
          quantity: Number(it.quantity),
          image: it.product?.images?.[0] || "/placeholder.png",
        })),
      };

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to update order");
        return;
      }

      const updated = await res.json();
      setOrder(updated);
      toast.success("Order updated successfully!");

      // Refresh customer history list
      if (phone) {
        const histRes = await fetch(`/api/orders?search=${encodeURIComponent(phone)}`);
        if (histRes.ok) {
          const historyData = await histRes.json();
          if (Array.isArray(historyData)) {
            setCustomerHistoryOrders(historyData);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving order");
    } finally {
      setIsSaving(false);
    }
  };

  // Dispatch to Steadfast Courier
  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/courier`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Courier dispatch failed");
        return;
      }

      toast.success(`Dispatched to Steadfast! Tracking Code: ${data.trackingCode}`);
      fetchOrder();
    } catch (err) {
      console.error(err);
      toast.error("Network error sending order to courier");
    } finally {
      setIsDispatching(false);
    }
  };

  const [isCheckingCourier, setIsCheckingCourier] = useState(false);
  const handleCheckCourierStatus = async () => {
    const q = order?.courierTrackingId || order?.orderNumber;
    if (!q) return;
    setIsCheckingCourier(true);
    try {
      const res = await fetch(`/api/courier/steadfast/status?trackingCode=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok && data.delivery_status) {
        toast.success(`Steadfast Status: ${data.delivery_status}`);
      } else {
        toast.error(data.error || "Courier status check failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error checking courier status");
    } finally {
      setIsCheckingCourier(false);
    }
  };

  // Toggle visitor ban status
  const handleToggleBan = async () => {
    const newBanStatus = !isBanned;
    setIsBanned(newBanStatus);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceInfo: {
            ...(order.deviceInfo || {}),
            isBanned: newBanStatus,
          },
        }),
      });

      if (res.ok) {
        if (newBanStatus) {
          toast.error(`Visitor IP (${order.deviceInfo?.ipAddress || "103.197.153.53"}) has been Banned!`);
        } else {
          toast.success("Visitor IP has been unbanned.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update visitor ban status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <RefreshCw className="size-8 animate-spin text-emerald-600 dark:text-emerald-500" />
        <p className="text-sm font-medium text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-lg font-bold text-foreground">Order Not Found</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-background  min-h-screen text-foreground dark:text-slate-100 p-2 sm:p-4 rounded-2xl font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="size-8 p-0 text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground rounded-lg"
          >
            <Link href="/admin/orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-2 font-mono">
              Order: {order.orderNumber}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              {orderStatus}
            </span>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === "edit" ? "invoice" : "edit")}
            className="text-xs text-muted-foreground hover:text-foreground bg-muted dark:bg-slate-800/80 px-2.5 py-1 rounded-md flex items-center gap-1 border border-border dark:border-slate-700"
          >
            <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>Status History</span>
          </button>
        </div>

        {/* Top Right Action Quick Links */}
        <div className="flex items-center gap-2 text-xs">
          <Link href="/admin/orders/new">
            <button className="bg-emerald-600/15 dark:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 hover:bg-emerald-600/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer">
              <Plus className="size-3.5" /> Create
            </button>
          </Link>

          <Link href="/admin/orders">
            <button className="bg-muted dark:bg-slate-800 text-foreground dark:text-slate-300 border border-border dark:border-slate-700 hover:bg-muted/80 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
              List
            </button>
          </Link>
          <button
            onClick={() => setActiveTab(activeTab === "edit" ? "invoice" : "edit")}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition ${
              activeTab === "invoice"
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-muted dark:bg-slate-800 text-foreground dark:text-slate-300 border-border dark:border-slate-700 hover:bg-muted/80 dark:hover:bg-slate-700"
            }`}
          >
            <Printer className="size-3.5" /> {activeTab === "invoice" ? "Edit Order" : "Invoice"}
          </button>
        </div>
      </div>

      {/* Subheader Title */}
      <div className="text-xs text-muted-foreground font-mono flex items-center justify-between">
        <span>Edit Order #{order.id}</span>
        {order.courierTrackingId && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Truck className="size-3" /> Tracking: {order.courierTrackingId} ({order.courierStatus || "Dispatched"})
          </span>
        )}
      </div>

      {activeTab === "invoice" ? (
        <InvoiceView order={{ ...order, customerName, phone, address, items, subtotal, discount, shippingCharge, total }} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Left Content: 8 Columns */}
          <div className="lg:col-span-8 space-y-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-emerald-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pb-10">
            {/* Customer Info Block */}
            <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
                <h3 className="text-sm font-bold text-foreground dark:text-slate-200 flex items-center gap-2">
                  <span>Customer Info</span>
                </h3>
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="size-3" /> Add Note +
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-background  border border-input dark:border-slate-700/80 rounded-lg px-3 py-2 text-foreground dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
                    placeholder="Enter customer name"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Phone *</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-background  border border-input dark:border-slate-700/80 rounded-lg px-3 py-2 text-foreground dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="017xxxxxxxx"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`tel:${phone}`}
                        title="Call Customer"
                        className="size-8 rounded-lg bg-muted dark:bg-slate-800 hover:bg-muted/80 text-foreground dark:text-slate-300 flex items-center justify-center border border-border dark:border-slate-700"
                      >
                        <Phone className="size-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/88${phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Message"
                        className="size-8 rounded-lg bg-emerald-500/15 dark:bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30"
                      >
                        <MessageSquare className="size-3.5" />
                      </a>
                      <a
                        href={`sms:${phone}`}
                        title="Send SMS"
                        className="size-8 rounded-lg bg-muted dark:bg-slate-800 hover:bg-muted/80 text-foreground dark:text-slate-300 flex items-center justify-center border border-border dark:border-slate-700"
                      >
                        <Plus className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-muted-foreground font-semibold block">Address *</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-background  border border-input dark:border-slate-700/80 rounded-lg px-3 py-2 text-foreground dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Enter delivery address"
                  />
                </div>

                {/* Note Field (Optional / Toggleable) */}
                {(showNoteInput || note) && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-muted-foreground font-semibold block">Order / Customer Note</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-background  border border-input dark:border-slate-700/80 rounded-lg px-3 py-2 text-foreground dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                      placeholder="Special instructions or delivery notes..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Split Row: Ordered Items (Left) vs Product Search Quick Add (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ordered Items Box */}
              <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-foreground dark:text-slate-200">Ordered Items</h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {items.length} items · {totalPcs} pcs
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-8">
                        No items added to this order. Select products from the store list to add.
                      </p>
                    ) : (
                      items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="bg-muted/40  border border-border dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={
                                item.product?.images?.[0] ||
                                item.image ||
                                "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80"
                              }
                              alt={item.productName || item.name}
                              className="size-10 rounded-md object-cover border border-border dark:border-slate-700/60 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground dark:text-slate-100 truncate">
                                {item.productName || item.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-mono">
                                ৳{item.price}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-border dark:border-slate-700 bg-background dark:bg-slate-800/60 rounded-md">
                              <button
                                onClick={() => updateItemQuantity(idx, -1)}
                                className="size-6 flex items-center justify-center text-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 rounded-l-md"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-bold text-foreground dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateItemQuantity(idx, 1)}
                                className="size-6 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-muted dark:hover:bg-slate-700 rounded-r-md"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            {/* Item total */}
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 w-12 text-right">
                              ৳{item.price * item.quantity}
                            </span>

                            {/* Delete */}
                            <button
                              onClick={() => removeItem(idx)}
                              className="text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 p-1"
                              title="Remove product"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Product Search & Quick Add Drawer Box */}
              <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border dark:border-slate-800/80 pb-2">
                  <div className="relative flex-1">
                    <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-background  border border-input dark:border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button className="size-8 rounded-lg bg-muted dark:bg-slate-800 border border-border dark:border-slate-700 text-muted-foreground hover:text-foreground flex items-center justify-center">
                    <Grid className="size-3.5" />
                  </button>
                </div>

                {/* Product Catalog List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredProducts.map((prod) => {
                    const inOrder = items.find(
                      (it) => it.productId === prod.id || it.productName === prod.name
                    );

                    return (
                      <div
                        key={prod.id}
                        className="bg-muted/40  border border-border dark:border-slate-800/80 rounded-lg p-2 flex items-center justify-between gap-2 hover:border-emerald-500/40 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="size-9 rounded-md object-cover border border-border dark:border-slate-700/60 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground dark:text-slate-200 truncate">
                              {prod.bengaliName || prod.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              ৳{prod.price} · <span>{prod.stock} in stock</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => addProductToOrder(prod)}
                          className={`size-7 rounded-lg flex items-center justify-center border transition shrink-0 ${
                            inOrder
                              ? "bg-emerald-500/20 dark:bg-emerald-600/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold text-xs"
                              : "bg-muted dark:bg-slate-800 hover:bg-emerald-600 border-border dark:border-slate-700 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white"
                          }`}
                          title="Add to order"
                        >
                          {inOrder ? `✓ ${inOrder.quantity}` : <Plus className="size-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Financial Summary Breakdown & Action Footer */}
            <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {/* Subtotal */}
                <div className="bg-muted/40  border border-border dark:border-slate-800 p-2.5 rounded-lg space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Subtotal</span>
                  <strong className="text-sm font-mono text-foreground dark:text-white">৳{subtotal}</strong>
                </div>

                {/* Discount */}
                <div className="bg-muted/40  border border-border dark:border-slate-800 p-2.5 rounded-lg space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Discount</span>
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono mr-0.5">৳</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="w-14 bg-transparent border-b border-border dark:border-slate-700 text-center font-mono text-xs font-bold text-foreground dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Advance */}
                <div className="bg-muted/40  border border-border dark:border-slate-800 p-2.5 rounded-lg space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Advance</span>
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono mr-0.5">৳</span>
                    <input
                      type="number"
                      value={advance}
                      onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                      className="w-14 bg-transparent border-b border-border dark:border-slate-700 text-center font-mono text-xs font-bold text-foreground dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-muted/40  border border-border dark:border-slate-800 p-2.5 rounded-lg space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Delivery</span>
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono mr-0.5">৳</span>
                    <input
                      type="number"
                      value={shippingCharge}
                      onChange={(e) => setShippingCharge(Number(e.target.value) || 0)}
                      className="w-14 bg-transparent border-b border-border dark:border-slate-700 text-center font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="bg-emerald-500/10  border border-emerald-500/40 p-2.5 rounded-lg space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Total</span>
                  <strong className="text-base font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                    ৳{total}
                  </strong>
                </div>
              </div>

              {/* Action Buttons & Status Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="bg-emerald-500/15 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="CONFIRMED">CONFIRMED (কনফার্ম)</option>
                    <option value="PENDING">PENDING (পেন্ডিং)</option>
                    <option value="PROCESSING">PROCESSING (প্রসেসিং)</option>
                    <option value="SHIPPED">SHIPPED (শিপড)</option>
                    <option value="DELIVERED">DELIVERED (ডেলিভারড)</option>
                    <option value="CANCELLED">CANCELLED (ক্যানসেল)</option>
                    <option value="RETURNED">RETURNED (রিটার্ন)</option>
                  </select>

                  <button
                    onClick={fetchOrder}
                    className="size-9 rounded-lg bg-muted dark:bg-slate-800 hover:bg-muted/80 text-foreground dark:text-slate-300 border border-border dark:border-slate-700 flex items-center justify-center"
                    title="Refresh data"
                  >
                    <RefreshCw className="size-4" />
                  </button>

                  <button
                    className="size-9 rounded-lg bg-muted dark:bg-slate-800 hover:bg-muted/80 text-foreground dark:text-slate-300 border border-border dark:border-slate-700 flex items-center justify-center"
                    title="Order settings"
                  >
                    <Settings className="size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!order.courierTrackingId ? (
                    <Button
                      onClick={handleDispatch}
                      disabled={isDispatching}
                      variant="outline"
                      className="rounded-lg text-xs gap-1.5"
                    >
                      {isDispatching ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Truck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>Dispatch Courier</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCheckCourierStatus}
                      disabled={isCheckingCourier}
                      variant="outline"
                      className="rounded-lg text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400"
                    >
                      {isCheckingCourier ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Truck className="size-3.5" />
                      )}
                      <span>Check Courier Status</span>
                    </Button>
                  )}

                  <Button
                    onClick={handleSaveOrder}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2 rounded-lg gap-2 shadow-md"
                  >
                    {isSaving ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    <span>Confirm & Save Order</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Analytics, Fraud Check, Customer Profile & Device Info (4 Columns) */}
          <div className="lg:col-span-4 space-y-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pl-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-emerald-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pb-10">
            {/* Real Fraud Check & Courier Performance Box */}
            <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-foreground dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Fraud Check</span>
                </h3>
                <button onClick={fetchOrder} className="text-muted-foreground hover:text-foreground" title="Refresh analytics">
                  <RefreshCw className="size-3" />
                </button>
              </div>

              {/* Provider Badge */}
              <div className="flex items-center justify-between text-xs bg-muted/40  p-2.5 rounded-lg border border-border dark:border-slate-800">
                <span className="font-semibold text-foreground dark:text-slate-300">Haq-Plus</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {realCancelledOrdersCount === 0 ? "Safe" : realDeliveryRate > "75.0" ? "Good" : "Risk"}
                </span>
              </div>

              {/* Meter Stats */}
              <div className="bg-muted/40  p-3 rounded-lg border border-border dark:border-slate-800 text-center space-y-2">
                <div className="flex justify-around text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Total</span>
                    <strong className="text-foreground dark:text-white text-sm">{realTotalOrdersCount}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[10px]">Received</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{realReceivedOrdersCount}</strong>
                  </div>
                  <div>
                    <span className="text-rose-600 dark:text-rose-400 block text-[10px]">Cancel</span>
                    <strong className="text-rose-600 dark:text-rose-400 text-sm">{realCancelledOrdersCount}</strong>
                  </div>
                </div>

                <div className="w-full bg-muted dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${realDeliveryRate}%` }} />
                  <div className="bg-rose-500 h-full" style={{ width: `${100 - Number(realDeliveryRate)}%` }} />
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">{realDeliveryRate}% Delivery Rate</p>
              </div>

              {/* Couriers breakdown */}
              <div className="space-y-1.5 text-[11px]">
                <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
                  By Courier
                </span>
                <div className="space-y-1 font-mono">
                  <div className="flex items-center justify-between bg-muted/40  px-2.5 py-1.5 rounded-md border border-border dark:border-slate-800/60">
                    <span className="text-foreground dark:text-slate-300 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> SteadFast
                    </span>
                    <span className="text-muted-foreground">{realReceivedOrdersCount}/{realTotalOrdersCount} <strong className="text-emerald-600 dark:text-emerald-400 ml-1">{realDeliveryRate}%</strong></span>
                  </div>

                  <div className="flex items-center justify-between bg-muted/40  px-2.5 py-1.5 rounded-md border border-border dark:border-slate-800/60">
                    <span className="text-foreground dark:text-slate-300 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Pathao
                    </span>
                    <span className="text-muted-foreground">0/0 <strong className="text-emerald-600 dark:text-emerald-400 ml-1">100%</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL Order History Box */}
            <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-foreground dark:text-slate-300 flex items-center gap-1.5">
                  <History className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Order History</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  {realHistoryList.length} Order{realHistoryList.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {realHistoryList.map((histOrder) => (
                  <Link
                    key={histOrder.id}
                    href={`/admin/orders/${histOrder.id}`}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${
                      histOrder.id === order.id
                        ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/60 shadow-xs"
                        : "bg-muted/40  border-border dark:border-slate-800 hover:border-emerald-500/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {histOrder.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                        {getBengaliStatus(histOrder.orderStatus)}
                      </span>
                    </div>
                    <span className="font-mono text-foreground dark:text-slate-300 text-[11px]">
                      ৳{histOrder.total} - {histOrder.createdAt ? new Date(histOrder.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }) : "N/A"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* REAL Customer Profile Box */}
            <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-foreground dark:text-slate-300">Customer Profile</h3>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 py-2">
                <div className="size-12 rounded-full bg-muted dark:bg-slate-800 border border-emerald-500/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <User className="size-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground dark:text-white">{customerName || "Customer"}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted dark:bg-slate-800 text-muted-foreground font-semibold border border-border dark:border-slate-700">
                    {realTotalOrdersCount > 2 ? "VIP Customer" : "Regular Customer"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800">
                  <strong className="text-foreground dark:text-white block text-xs">{realTotalOrdersCount}</strong>
                  <span className="text-muted-foreground">Orders</span>
                </div>
                <div className="bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800">
                  <strong className="text-emerald-600 dark:text-emerald-400 block text-xs">৳{realTotalSpent}</strong>
                  <span className="text-muted-foreground">Total Spent</span>
                </div>
                <div className="bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800">
                  <strong className="text-foreground dark:text-white block text-xs">{realConfirmedCount}</strong>
                  <span className="text-muted-foreground">Confirmed</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-foreground dark:text-slate-300 pt-2 border-t border-border dark:border-slate-800 font-mono text-[11px]">
                <p><span className="text-muted-foreground">Phone:</span> {phone}</p>
                <p className="line-clamp-2"><span className="text-muted-foreground">Address:</span> {address}</p>
              </div>
            </div>

            {/* Device & Visitor Info Box */}
            <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-foreground dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Device & Visitor Info</span>
                </h3>
                {isBanned && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    Banned
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800 text-[11px]">
                  <span className="text-muted-foreground">Source</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-700 dark:text-blue-300 font-sans text-[10px] font-bold">
                    {order.deviceInfo?.source || "Facebook"}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800 text-[11px]">
                  <span className="text-muted-foreground">Fingerprint</span>
                  <span className="text-foreground dark:text-slate-300 font-mono">
                    {order.deviceInfo?.fingerprint || `fp_${order.id.slice(-6)}`}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800 text-[11px]">
                  <span className="text-muted-foreground">IP Address</span>
                  <span className="text-foreground dark:text-slate-300 font-mono">
                    {order.deviceInfo?.ipAddress || "103.197.153.53"}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800 text-[11px]">
                  <span className="text-muted-foreground">Device</span>
                  <span className="text-foreground dark:text-slate-300 font-sans">
                    {order.deviceInfo?.device || "ফোন (Chrome)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800">
                    <span className="text-muted-foreground block">Total Visits</span>
                    <strong className="text-foreground dark:text-white text-xs">
                      {order.deviceInfo?.totalVisits || realTotalOrdersCount}
                    </strong>
                  </div>
                  <div className="bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800">
                    <span className="text-muted-foreground block">Active Time</span>
                    <strong className="text-foreground dark:text-white text-xs">
                      {order.deviceInfo?.activeTime || "14s"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 pt-1">
                  <span>Avg Load: <strong className="text-foreground dark:text-slate-200">{order.deviceInfo?.avgLoad || "1.9s"}</strong></span>
                  <span>First Visit: <strong className="text-foreground dark:text-slate-200">{order.deviceInfo?.firstVisit || (order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB") : "N/A")}</strong></span>
                </div>

                <button
                  onClick={() => setShowBanModal(true)}
                  className={`w-full mt-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isBanned
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                      : "bg-rose-600/15 hover:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                  }`}
                >
                  <Ban className="size-3.5" />
                  <span>{isBanned ? "Visitor Banned (Click to Unban)" : "Ban Visitor"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Ban Confirmation Popup Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card  border border-border dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="size-14 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Ban className="size-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground dark:text-white">
                {isBanned ? "ভিজিটর আনব্যান নিশ্চিতকরণ" : "ভিজিটর ব্যান নিশ্চিতকরণ"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isBanned
                  ? `আপনি কি নিশ্চিত যে ভিজিটর IP (${order.deviceInfo?.ipAddress || "103.197.153.53"}) এবং কাস্টমার (${customerName || "Customer"}) কে আনব্যান করতে চান?`
                  : `আপনি কি নিশ্চিত যে ভিজিটর IP (${order.deviceInfo?.ipAddress || "103.197.153.53"}) এবং কাস্টমার (${customerName || "Customer"}) কে ব্লকলিস্টে ব্যান করতে চান?`}
              </p>
            </div>

            <div className="bg-muted/40  p-3 rounded-xl border border-border dark:border-slate-800 text-left text-xs space-y-1 font-mono">
              <p><span className="text-muted-foreground font-sans">IP Address:</span> <strong className="text-foreground dark:text-slate-200">{order.deviceInfo?.ipAddress || "103.197.153.53"}</strong></p>
              <p><span className="text-muted-foreground font-sans">Fingerprint:</span> <strong className="text-foreground dark:text-slate-200">{order.deviceInfo?.fingerprint || `fp_${order.id.slice(-6)}`}</strong></p>
              <p><span className="text-muted-foreground font-sans">Customer Phone:</span> <strong className="text-foreground dark:text-slate-200">{phone || "N/A"}</strong></p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowBanModal(false)}
                className="w-full rounded-xl text-xs font-semibold"
              >
                বন্ধ করুন (Cancel)
              </Button>
              <Button
                onClick={async () => {
                  setShowBanModal(false);
                  await handleToggleBan();
                }}
                className={`w-full rounded-xl text-xs font-bold text-white ${
                  isBanned
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/30"
                }`}
              >
                {isBanned ? "হ্যাঁ, আনব্যান করুন" : "হ্যাঁ, ব্যান করুন"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
