"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "@/components/ui/toast";
import { TEA_PRODUCTS, TeaProduct } from "@/lib/data/tea-products";

export default function AdminCreateNewOrderPage() {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Customer & Order Form States (Matching /admin/orders/[id] style)
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

  // Product Catalog & Search State
  const [catalogProducts, setCatalogProducts] = useState<any[]>(TEA_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");

  // Customer History & Fraud check state based on typed phone
  const [customerHistoryOrders, setCustomerHistoryOrders] = useState<any[]>([]);
  const [isBanned, setIsBanned] = useState(false);

  // Load live DB products if available
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products?all=true");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setCatalogProducts(data.products);
          }
        }
      } catch (err) {
        console.warn("Using default tea products catalog:", err);
      }
    }
    loadProducts();
  }, []);

  // Auto-lookup past orders when phone number changes
  useEffect(() => {
    const cleanPhone = phone.trim();
    if (cleanPhone.length >= 6) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/orders?search=${encodeURIComponent(cleanPhone)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setCustomerHistoryOrders(data);
              // Auto-fill customer name & address if customer exists
              if (data.length > 0) {
                const lastOrder = data[0];
                if (!customerName && lastOrder.customerName) {
                  setCustomerName(lastOrder.customerName);
                }
                if (!address && lastOrder.address) {
                  setAddress(lastOrder.address);
                }
              }
            }
          }
        } catch (err) {
          // ignore lookup error
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setCustomerHistoryOrders([]);
    }
  }, [phone]);

  // Derived financial totals
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const total = Math.max(0, subtotal - discount - advance + shippingCharge);
  const totalPcs = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // Customer history statistics
  const realTotalOrdersCount = customerHistoryOrders.length;
  const realCancelledOrdersCount = customerHistoryOrders.filter(
    (o) => o.orderStatus === "CANCELLED" || o.orderStatus === "RETURNED"
  ).length;
  const realReceivedOrdersCount = Math.max(0, realTotalOrdersCount - realCancelledOrdersCount);
  const realDeliveryRate =
    realTotalOrdersCount > 0
      ? ((realReceivedOrdersCount / realTotalOrdersCount) * 100).toFixed(1)
      : "100.0";

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

  // Quantity stepper
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

  const addProductToOrder = (prod: any) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === prod.id || it.productName === (prod.name || prod.bengaliName)
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
          productName: prod.bengaliName || prod.name,
          price: Number(prod.price || prod.basePrice),
          quantity: 1,
          product: {
            id: prod.id,
            name: prod.bengaliName || prod.name,
            images: prod.images || ["/placeholder.png"],
          },
        },
      ];
    });
    toast.success(`Added ${prod.bengaliName || prod.name} to order`);
  };

  // Product Catalog Search filter
  const filteredProducts = catalogProducts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const pName = (p.name || "").toLowerCase();
    const pBengali = (p.bengaliName || "").toLowerCase();
    const pSku = (p.sku || "").toLowerCase();
    return pName.includes(q) || pBengali.includes(q) || pSku.includes(q);
  });

  // Submit and create new order
  const handleSaveNewOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      toast.error("Please enter valid 11 digit mobile number");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter delivery address");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least 1 product to the order");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        division: "Dhaka",
        district: shippingCharge === 60 ? "Dhaka" : "Outside Dhaka",
        area: shippingCharge === 60 ? "Inside BD" : "Outside BD",
        paymentMethod: "COD",
        hasNote: Boolean(note.trim()),
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
          image: it.product?.images?.[0] || it.image || "/placeholder.png",
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create order");
        setIsSaving(false);
        return;
      }

      toast.success(`New order created successfully! (${data.order.orderNumber})`);
      router.push(`/admin/orders/${data.order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 bg-background  min-h-screen text-foreground dark:text-slate-100 p-2 sm:p-4 rounded-2xl font-sans transition-colors duration-200">
      {/* Top Header Bar (Matching /admin/orders/[id] style) */}
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
              Create New Order
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              NEW ENTRY
            </span>
          </div>

          <div className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/80 px-2.5 py-1 rounded-md flex items-center gap-1 border border-border dark:border-slate-700">
            <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>Manual Admin Entry</span>
          </div>
        </div>

        {/* Top Right Quick Links */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/orders"
            className="bg-muted dark:bg-slate-800 text-foreground dark:text-slate-300 border border-border dark:border-slate-700 hover:bg-muted/80 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" /> List
          </Link>
          <button className="bg-emerald-600/15 dark:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 hover:bg-emerald-600/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition">
            <Plus className="size-3.5" /> New Order
          </button>
        </div>
      </div>

      {/* Subheader Title */}
      <div className="text-xs text-muted-foreground font-mono flex items-center justify-between">
        <span>Enter Customer Details & Add Products below</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <Package className="size-3" /> Ready for Dispatch
        </span>
      </div>

      {/* Main 12-Column Grid Layout (Matching /admin/orders/[id] style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Left Content: 8 Columns */}
        <div className="lg:col-span-8 space-y-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-emerald-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pb-10">
          {/* Customer Info Block */}
          <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
              <h3 className="text-sm font-bold text-foreground dark:text-slate-200 flex items-center gap-2">
                <User className="size-4 text-emerald-600 dark:text-emerald-400" />
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
                  required
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
                    required
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {phone && (
                      <>
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
                      </>
                    )}
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
                  placeholder="Enter delivery address (House, Road, Thana, District)"
                  required
                />
              </div>

              {/* Note Field */}
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
                    <div className="p-8 text-center border-2 border-dashed border-border/70 dark:border-slate-800 rounded-xl space-y-2 my-2">
                      <Package className="size-8 text-muted-foreground/60 mx-auto" />
                      <p className="text-xs font-semibold text-muted-foreground">
                        No items added to this order
                      </p>
                      <p className="text-[11px] text-muted-foreground/80">
                        Select products from the store search box on the right.
                      </p>
                    </div>
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
                              type="button"
                              onClick={() => updateItemQuantity(idx, -1)}
                              className="size-6 flex items-center justify-center text-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 rounded-l-md cursor-pointer"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-7 text-center font-mono text-xs font-bold text-foreground dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(idx, 1)}
                              className="size-6 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-muted dark:hover:bg-slate-700 rounded-r-md cursor-pointer"
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
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
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
                <button
                  type="button"
                  className="size-8 rounded-lg bg-muted dark:bg-slate-800 border border-border dark:border-slate-700 text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <Grid className="size-3.5" />
                </button>
              </div>

              {/* Product Catalog List */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredProducts.map((prod) => {
                  const inOrder = items.find(
                    (it) => it.productId === prod.id || it.productName === (prod.name || prod.bengaliName)
                  );

                  return (
                    <div
                      key={prod.id}
                      className="bg-muted/40  border border-border dark:border-slate-800/80 rounded-lg p-2 flex items-center justify-between gap-2 hover:border-emerald-500/40 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={prod.images?.[0] || "/placeholder.png"}
                          alt={prod.name}
                          className="size-9 rounded-md object-cover border border-border dark:border-slate-700/60 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground dark:text-slate-200 truncate">
                            {prod.bengaliName || prod.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            ৳{prod.price || prod.basePrice} · <span>{prod.stock || 99} in stock</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addProductToOrder(prod)}
                        className={`size-7 rounded-lg flex items-center justify-center border transition shrink-0 cursor-pointer ${
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
                  type="button"
                  onClick={() => {
                    setCustomerName("");
                    setPhone("");
                    setAddress("");
                    setItems([]);
                    setDiscount(0);
                    setAdvance(0);
                  }}
                  className="size-9 rounded-lg bg-muted dark:bg-slate-800 hover:bg-muted/80 text-foreground dark:text-slate-300 border border-border dark:border-slate-700 flex items-center justify-center cursor-pointer"
                  title="Reset form"
                >
                  <RefreshCw className="size-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleSaveNewOrder}
                  disabled={isSaving || items.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg gap-2 shadow-md cursor-pointer"
                >
                  {isSaving ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  <span>Confirm & Save New Order</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Analytics & Fraud Check, Customer Profile & Device Info (4 Columns) */}
        <div className="lg:col-span-4 space-y-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pl-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-emerald-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pb-10">
          {/* Fraud Check & Courier Performance Box */}
          <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-foreground dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Fraud Check</span>
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Live</span>
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
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                {realDeliveryRate}% Delivery Rate
              </p>
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
                  <span className="text-muted-foreground">
                    {realReceivedOrdersCount}/{realTotalOrdersCount}{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 ml-1">{realDeliveryRate}%</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/40  px-2.5 py-1.5 rounded-md border border-border dark:border-slate-800/60">
                  <span className="text-foreground dark:text-slate-300 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" /> Pathao
                  </span>
                  <span className="text-muted-foreground">
                    0/0 <strong className="text-emerald-600 dark:text-emerald-400 ml-1">100%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* REAL Customer Order History Box */}
          <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-foreground dark:text-slate-300 flex items-center gap-1.5">
                <History className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Customer Order History</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                {customerHistoryOrders.length} Order{customerHistoryOrders.length !== 1 ? "s" : ""}
              </span>
            </div>

            {customerHistoryOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                Enter phone number to view customer past orders...
              </p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {customerHistoryOrders.map((histOrder) => (
                  <Link
                    key={histOrder.id}
                    href={`/admin/orders/${histOrder.id}`}
                    className="p-2.5 rounded-lg border bg-muted/40  border-border dark:border-slate-800 hover:border-emerald-500/40 flex items-center justify-between text-xs transition"
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
                      ৳{histOrder.total} -{" "}
                      {histOrder.createdAt ? new Date(histOrder.createdAt).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                      }) : "N/A"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* REAL Customer Profile Box */}
          <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-foreground dark:text-slate-300">Customer Profile</h3>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="size-10 rounded-full bg-muted dark:bg-slate-800 flex items-center justify-center">
                <User className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{customerName || "New Customer"}</p>
                <p className="text-[10px] text-muted-foreground">{phone || "No phone provided"}</p>
              </div>
            </div>
          </div>

          {/* Device & Visitor Info Box */}
          <div className="bg-card  border border-border dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border dark:border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-foreground dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Device & Visitor Info</span>
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800 text-[11px]">
                <span className="text-muted-foreground">Source</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-700 dark:text-blue-300 font-sans text-[10px] font-bold">
                  Direct Web
                </span>
              </div>
              <div className="flex items-center justify-between bg-muted/40  p-2 rounded-lg border border-border dark:border-slate-800 text-[11px]">
                <span className="text-muted-foreground">Device</span>
                <span className="text-foreground dark:text-slate-300 font-sans">
                  Desktop (Admin Chrome)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
