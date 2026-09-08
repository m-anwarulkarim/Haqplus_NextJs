"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useCartStore, useCartHydration } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function CartPage() {
  const hasHydrated = useCartHydration();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getShippingCharge,
    getTotal,
    getTotalItems,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!hasHydrated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="h-64 rounded-3xl bg-muted/30 animate-pulse max-w-2xl mx-auto" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingCharge();
  const total = getTotal();
  const totalItems = getTotalItems();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.error || "Invalid coupon code");
        return;
      }

      applyCoupon({
        code: data.coupon.code,
        type: data.coupon.type,
        value: data.coupon.value,
        minPurchase: data.coupon.minPurchase,
      });

      setCouponInput("");
      toast.success(`Coupon ${data.coupon.code} applied successfully!`);
    } catch (err) {
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="size-20 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="size-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Cart is Currently Empty
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore our curated catalog to discover premium electronics, stylish apparel, and lifestyle goods.
          </p>
          <div className="pt-4">
            <Button asChild className="rounded-2xl h-11 px-6 shadow-sm">
              <Link href="/products">Explore Catalog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between border-b border-border/80 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review your {totalItems} selected {totalItems === 1 ? "item" : "items"} before proceeding to checkout.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-border/70 rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xs">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative size-20 rounded-2xl border border-border/80 bg-muted/30 overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                      {item.size && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium capitalize">
                          Color: {item.color}
                        </span>
                      )}
                      {item.sku && (
                        <span className="font-mono text-[11px]">SKU: {item.sku}</span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-foreground font-mono mt-1 sm:hidden">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="flex items-center border border-border rounded-xl bg-background shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-20">
                    <p className="text-base font-extrabold text-foreground font-mono">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-muted-foreground hidden sm:block">
                        ${item.price.toFixed(2)} ea
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-xs">
              <Truck className="size-4 text-primary shrink-0" />
              <span>Fast Express Dispatch via Steadfast</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-xs">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>100% Genuine Certified Goods</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-xs">
              <RotateCcw className="size-4 text-primary shrink-0" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground">Order Summary</h3>

            {/* Price Calculations */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className="font-mono text-foreground">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="border-t border-border/80 pt-3 flex justify-between text-base font-extrabold text-foreground">
                <span>Total Amount</span>
                <span className="text-xl font-mono text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="border-t border-border/60 pt-4 space-y-2">
              <label htmlFor="coupon" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="size-3.5 text-primary" />
                <span>Have a discount coupon?</span>
              </label>

              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <Check className="size-3.5" />
                    <span>{coupon.code} (-${discount.toFixed(2)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-muted-foreground hover:text-destructive underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="WELCOME20 or SAVE10"
                    className="h-10 text-xs rounded-xl"
                  />
                  <Button
                    type="submit"
                    disabled={isApplyingCoupon}
                    size="sm"
                    className="h-10 px-4 rounded-xl text-xs font-semibold"
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout CTA */}
            <div className="pt-2">
              <Button asChild size="lg" className="w-full h-12 rounded-2xl text-sm font-semibold shadow-md group">
                <Link href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
