"use client";

import { useCartStore, useCartHydration } from "@/lib/store/cart-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FREE_SHIPPING_THRESHOLD = 75;

export function CartSheet() {
  const hasHydrated = useCartHydration();
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    getTotalItems,
    getSubtotal,
  } = useCartStore();

  const totalItems = hasHydrated ? getTotalItems() : 0;
  const subtotal = hasHydrated ? getSubtotal() : 0;
  const progressToFreeShipping = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-background border-l border-border/80 shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="p-4 sm:p-5 border-b border-border/70 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Your Shopping Cart
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"} selected
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-muted/40 px-4 sm:px-5 py-3 border-b border-border/50">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <div className="flex items-center gap-1.5 text-foreground">
              <Truck className="size-3.5 text-primary" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add{" "}
                  <strong className="text-primary font-bold">
                    ${remainingForFreeShipping.toFixed(2)}
                  </strong>{" "}
                  more for <span className="font-semibold">Free Shipping</span>
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="size-3" />
                  Unlocked Free Standard Shipping!
                </span>
              )}
            </div>
            <span className="text-muted-foreground font-mono text-[11px]">
              {Math.round(progressToFreeShipping)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-border/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="size-16 rounded-full bg-muted/60 flex items-center justify-center mb-4 text-muted-foreground">
                <ShoppingBag className="size-8" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                Your cart is currently empty
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mb-6">
                Looks like you haven&apos;t added anything to your cart yet. Explore
                our latest arrivals to find something special!
              </p>
              <Button
                onClick={() => setIsOpen(false)}
                asChild
                className="rounded-full shadow-xs"
              >
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                <div className="relative size-20 rounded-xl border border-border/70 bg-muted/30 overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {item.category && (
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {item.category}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-lg bg-background shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Summary & CTA */}
        {items.length > 0 && (
          <SheetFooter className="p-4 sm:p-5 border-t border-border/70 bg-muted/20 flex flex-col gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground font-mono">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className="font-medium text-foreground">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      FREE
                    </span>
                  ) : (
                    "$9.99"
                  )}
                </span>
              </div>
              <div className="border-t border-border/60 pt-2 flex items-center justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span className="font-mono text-primary text-lg">
                  $
                  {(
                    subtotal +
                    (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 9.99)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                asChild
                className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm group"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full text-xs rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/cart">View Full Cart Details</Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
