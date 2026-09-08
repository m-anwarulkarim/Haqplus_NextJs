import { getResilientOrder } from "@/lib/orders-store";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ payment?: string; trxId?: string }>;
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: OrderSuccessPageProps) {
  const { orderNumber } = await params;
  await searchParams;

  const order = await getResilientOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discount);
  const shipping = Number(order.shippingCharge);
  const total = Number(order.total);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 mx-auto shadow-sm animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="size-8" />
          </div>

          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600">
            Order Confirmed
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Thank You For Your Order!
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            We&apos;ve received your order and our fulfillment team is preparing your package
            for dispatch via Steadfast Courier.
          </p>

          <div className="pt-2">
            <span className="inline-block rounded-xl border border-border bg-muted/40 px-4 py-1.5 font-mono text-xs font-bold text-foreground">
              Order Number: {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-3">
            Order Information & Summary
          </h3>

          {/* Delivery & Payment Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground block">Shipping Address:</span>
              <p className="font-semibold text-foreground">{order.customerName}</p>
              <p className="text-muted-foreground">{order.address}</p>
              <p className="text-muted-foreground">
                {order.district}, Bangladesh
              </p>
              <p className="font-mono text-muted-foreground">{order.phone}</p>
              {order.email && <p className="text-muted-foreground">{order.email}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground block">Payment Details:</span>
              <p className="font-semibold text-foreground">
                Method:{" "}
                <span className="uppercase text-primary font-bold">
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                </span>
              </p>
              <p className="text-muted-foreground">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    order.paymentStatus === "PAID"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p className="text-muted-foreground">
                Courier:{" "}
                <span className="font-medium text-foreground">
                  Steadfast Courier Bangladesh
                </span>
              </p>
              {order.courierTrackingId && (
                <p className="font-mono text-xs text-primary font-bold">
                  Tracking: {order.courierTrackingId}
                </p>
              )}
            </div>
          </div>

          {order.note && (
            <div className="rounded-xl bg-muted/40 p-3 text-xs border border-border/60">
              <span className="font-semibold text-foreground block mb-0.5">Special Instructions / Note:</span>
              <p className="text-muted-foreground italic">&ldquo;{order.note}&rdquo;</p>
            </div>
          )}

          {/* Items List */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Ordered Items ({order.items.length})
            </h4>
            <div className="divide-y divide-border/60">
              {order.items.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 rounded-xl border border-border/80 bg-muted/30 overflow-hidden shrink-0">
                      <Image
                        src={it.product?.images?.[0] || "/placeholder.png"}
                        alt={it.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{it.productName}</p>
                      <p className="text-muted-foreground">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    ${(Number(it.price) * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border/60 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span className="font-mono">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping Fee</span>
              <span className="font-mono text-foreground">
                {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-border/60 pt-2 flex justify-between text-sm font-extrabold text-foreground">
              <span>Total Payable</span>
              <span className="font-mono text-primary text-base">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Button asChild className="w-full sm:w-auto rounded-2xl h-11 px-6 shadow-sm gap-2">
            <Link href="/products">
              <ShoppingBag className="size-4" />
              <span>Continue Shopping</span>
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full sm:w-auto rounded-2xl h-11 px-6 gap-2">
            <Link href={`/order/track/${order.orderNumber}`}>
              <Truck className="size-4" />
              <span>Track Delivery</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
