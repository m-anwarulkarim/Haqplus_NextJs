"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  CheckSquare,
  Square,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
} from "lucide-react";
import { useCartStore, useCartHydration } from "@/lib/store/cart-store";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validations/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { trackEvent } from "@/lib/tracking";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const hasHydrated = useCartHydration();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAltPhone, setShowAltPhone] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const {
    items,
    coupon,
    getSubtotal,
    getDiscountAmount,
    getShippingCharge,
    getTotal,
    clearCart,
  } = useCartStore();

  const subtotal = hasHydrated ? getSubtotal() : 0;
  const discount = hasHydrated ? getDiscountAmount() : 0;
  const shipping = hasHydrated ? getShippingCharge() : 0;
  const total = hasHydrated ? getTotal() : 0;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: session?.user?.name || "",
      phone: "",
      email: session?.user?.email || "",
      address: "",
      hasNote: false,
      note: "",
      paymentMethod: "COD",
      division: "Dhaka",
      district: "Dhaka",
      area: "Inside BD",
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");
  const hasNoteChecked = watch("hasNote");

  // Populate logged in user details if available
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setValue("customerName", session.user.name);
      if (session.user.email) setValue("email", session.user.email);
    }
  }, [session, setValue]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("আপনার কার্টে কোনো পণ্য নেই");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: data.customerName.trim(),
        phone: data.phone.trim().replace(/\s+/g, ""),
        address: data.address.trim(),
        email: data.email?.trim() || null,
        hasNote: Boolean(data.hasNote),
        note: data.hasNote && data.note ? data.note.trim() : null,
        paymentMethod: data.paymentMethod,
        division: data.division || "Dhaka",
        district: data.district || "Dhaka",
        area: data.area || "Inside BD",
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || null,
          name: it.name,
          price: Number(it.price),
          quantity: Number(it.quantity),
          image: it.image || "",
        })),
        couponCode: coupon?.code || null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.message || resData.error || "অর্ডার সম্পন্ন হতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        setIsSubmitting(false);
        return;
      }

      const createdOrder = resData.order;

      // Track purchase event with dual-pixel CAPI
      trackEvent("Purchase", {
        order_id: createdOrder.orderNumber,
        value: createdOrder.total,
        currency: "BDT",
        num_items: items.reduce((acc, it) => acc + it.quantity, 0),
      });

      // Clear the cart
      clearCart();
      toast.success("অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");

      // Handle payment redirection
      if (data.paymentMethod === "BKASH") {
        const bkashRes = await fetch("/api/payment/bkash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdOrder.id,
            amount: createdOrder.total,
          }),
        });
        const bkashData = await bkashRes.json();
        router.push(bkashData.paymentUrl || `/order/success/${createdOrder.orderNumber}`);
      } else if (data.paymentMethod === "SSLCOMMERZ") {
        const sslRes = await fetch("/api/payment/sslcommerz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdOrder.id,
            amount: createdOrder.total,
          }),
        });
        const sslData = await sslRes.json();
        router.push(sslData.gatewayUrl || `/order/success/${createdOrder.orderNumber}`);
      } else {
        // Cash on Delivery
        router.push(`/order/success/${createdOrder.orderNumber}`);
      }
    } catch (err) {
      console.error("Checkout submission error:", err);
      toast.error("অর্ডার সম্পন্ন করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন");
      setIsSubmitting(false);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="h-96 rounded-3xl bg-muted/30 animate-pulse max-w-3xl mx-auto" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="size-20 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="size-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            আপনার কার্ট খালি
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            অর্ডার করতে প্রথমে আপনার পছন্দের পণ্য কার্টে যোগ করুন।
          </p>
          <div className="pt-4">
            <Button asChild className="rounded-2xl h-11 px-6 shadow-sm">
              <Link href="/products">পণ্য দেখুন</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-6xl">
      <div className="border-b border-border/80 pb-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          অর্ডার সম্পন্ন করুন (Express Checkout)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          অর্ডারটি কনফার্ম করতে নিচের তথ্যগুলো পূরণ করুন। দ্রুত ও নিরাপদে ডেলিভারি পৌঁছে দেওয়া হবে।
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer Form & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-5">
              {/* Header with Badge & Requirement note */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#0f6848] text-white text-sm font-bold shadow-xs shrink-0">
                    ১
                  </span>
                  <span>ডেলিভারি ঠিকানা দিন</span>
                </h2>
                <span className="text-xs text-slate-400 font-medium">* আবশ্যক</span>
              </div>

              <div className="space-y-4">
                {/* 1. Full Name */}
                <div className="space-y-1">
                  <Label htmlFor="customerName" className="text-xs sm:text-sm font-medium text-slate-700 block">
                    নাম
                  </Label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="customerName"
                      placeholder="এখানে আপনার নাম লিখুন"
                      className="h-12 pl-10 pr-4 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-[#0f6848] focus-visible:ring-2 focus-visible:ring-[#0f6848]/15 transition-all"
                      {...register("customerName")}
                    />
                  </div>
                  {errors.customerName && (
                    <p className="text-xs text-destructive pt-0.5">{errors.customerName.message}</p>
                  )}
                </div>

                {/* 2. Phone Number */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-slate-700 block">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="h-12 pl-10 pr-4 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-[#0f6848] focus-visible:ring-2 focus-visible:ring-[#0f6848]/15 transition-all"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive pt-0.5">{errors.phone.message}</p>
                  )}
                </div>

                {/* 3. Full Address */}
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs sm:text-sm font-medium text-slate-700 block">
                    বিস্তারিত ঠিকানা <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 size-4 text-slate-400 pointer-events-none" />
                    <Textarea
                      id="address"
                      rows={3}
                      placeholder="এখানে আপনার সম্পূর্ণ ঠিকানা লিখুন"
                      className="pl-10 pr-4 py-3 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-[#0f6848] focus-visible:ring-2 focus-visible:ring-[#0f6848]/15 transition-all resize-none"
                      {...register("address")}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-destructive pt-0.5">{errors.address.message}</p>
                  )}
                </div>

                {/* Optional Action Chips / Toggle Pills */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowAltPhone(!showAltPhone)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        showAltPhone
                          ? "bg-emerald-50 border-[#0f6848] text-[#0f6848]"
                          : "bg-[#f1f3f5] border-slate-200/80 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Plus className="size-3.5 text-slate-500" />
                      <span>বিকল্প নম্বর</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowNote(!showNote);
                        setValue("hasNote", !showNote);
                      }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        showNote
                          ? "bg-emerald-50 border-[#0f6848] text-[#0f6848]"
                          : "bg-[#f1f3f5] border-slate-200/80 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Plus className="size-3.5 text-slate-500" />
                      <span>বিশেষ নির্দেশনা</span>
                    </button>
                  </div>

                  {/* Optional Alternative Phone Input */}
                  {showAltPhone && (
                    <div className="pt-1 animate-in fade-in-50 duration-200 space-y-1">
                      <Label htmlFor="altPhone" className="text-xs font-medium text-slate-700 block">
                        বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                      </Label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="altPhone"
                          type="tel"
                          placeholder="অন্য একটি মোবাইল নম্বর (যদি থাকে)"
                          className="h-11 pl-10 pr-4 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm font-mono"
                          {...register("altPhone")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Optional Special Instructions Textarea */}
                  {showNote && (
                    <div className="pt-1 animate-in fade-in-50 duration-200 space-y-1">
                      <Label htmlFor="note" className="text-xs font-medium text-slate-700 block">
                        বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
                        <Textarea
                          id="note"
                          rows={2}
                          placeholder="যেমন: শুক্রবারে ডেলিভারি দিন, অথবা পৌঁছানোর আগে ফোনে কথা বলে নিন..."
                          className="pl-10 pr-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-xs sm:text-sm resize-none"
                          {...register("note")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-4">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                    ২
                  </span>
                  <span>পেমেন্ট মাধ্যম</span>
                </h2>
              </div>

              {/* Cash on Delivery Only */}
              <div
                onClick={() => setValue("paymentMethod", "COD")}
                className="relative flex items-center gap-4 rounded-2xl border-2 border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20 p-4 sm:p-5 cursor-pointer transition-all"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shrink-0">
                  <Banknote className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">
                      Cash on Delivery
                    </span>
                    <span className="rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-bold">
                      পণ্য হাতে পেয়ে মূল্য পরিশোধ
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground leading-snug mt-1 block">
                    অর্ডার কনফার্ম করার পর ডেলিভারি ম্যান আপনার ঠিকানায় পণ্য পৌঁছে দেবে, পণ্য দেখে টাকা পরিশোধ করবেন।
                  </span>
                </div>
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary Card */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center justify-between">
                <span>অর্ডার সামারি</span>
                <span className="text-xs font-normal text-muted-foreground">({items.length}টি পণ্য)</span>
              </h2>

              {/* Items List Mini Preview */}
              <div className="max-h-64 overflow-y-auto divide-y divide-border/60 pr-1 space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                    <div className="relative size-12 rounded-xl border border-border/80 bg-muted/30 overflow-hidden shrink-0">
                      <Image src={it.image} alt={it.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{it.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        পরিমাণ: {it.quantity} {it.size ? `• ${it.size}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono text-foreground">
                      ${(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Rows */}
              <div className="border-t border-border/80 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>পণ্যের মূল্য (Subtotal)</span>
                  <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>কুপন ছাড় ({coupon?.code})</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>ডেলিভারি চার্জ (Steadfast Courier)</span>
                  <span className="font-mono text-foreground">
                    {shipping === 0 ? <strong className="text-emerald-600">ফ্রি</strong> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-border/80 pt-3 flex justify-between text-base font-extrabold text-foreground">
                  <span>সর্বমোট প্রদেয় (Total)</span>
                  <span className="text-xl font-mono text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full h-12 rounded-2xl text-sm font-semibold shadow-md gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>অর্ডার কনফার্ম হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>অর্ডার কনফার্ম করুন</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>১০০% নিরাপদ কেনাকাটা ও দ্রুততম হোম ডেলিভারি</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
