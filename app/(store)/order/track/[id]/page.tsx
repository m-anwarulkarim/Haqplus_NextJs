import { getResilientOrder } from "@/lib/orders-store";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface OrderTrackPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackPage({ params }: OrderTrackPageProps) {
  const { id } = await params;

  const order = await getResilientOrder(id);

  if (!order) {
    notFound();
  }

  // Determine active steps based on orderStatus & courierStatus
  const statusSteps = [
    {
      title: "Order Placed",
      desc: "Your order details have been recorded",
      date: order.createdAt,
      completed: true,
    },
    {
      title: "Order Confirmed",
      desc: "Merchant verified and packaged the items",
      completed:
        order.orderStatus === "CONFIRMED" ||
        order.orderStatus === "PROCESSING" ||
        order.orderStatus === "SHIPPED" ||
        order.orderStatus === "DELIVERED",
    },
    {
      title: "Handed to Steadfast Courier",
      desc: order.courierTrackingId
        ? `Consignment: ${order.courierTrackingId}`
        : "Courier dispatch pending",
      completed:
        order.orderStatus === "SHIPPED" ||
        order.orderStatus === "DELIVERED" ||
        Boolean(order.courierTrackingId),
    },
    {
      title: "Out for Delivery",
      desc: "Courier rider is en route to recipient address",
      completed:
        order.courierStatus === "out_for_delivery" ||
        order.orderStatus === "DELIVERED",
    },
    {
      title: "Delivered",
      desc: "Package delivered safely to recipient",
      completed: order.orderStatus === "DELIVERED",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Store</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Courier Tracking
              </span>
              <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                Order #{order.orderNumber}
              </h1>
            </div>

            <span className="rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
              Status: {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Steadfast Courier Info Box */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Truck className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Steadfast Courier Delivery
                </h3>
                <p className="text-xs text-muted-foreground">
                  Official Nationwide Express Logistics Partner
                </p>
              </div>
            </div>

            {order.courierTrackingId && (
              <span className="font-mono text-xs bg-muted px-2.5 py-1 rounded-xl font-bold text-foreground">
                {order.courierTrackingId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-border/60">
            <div>
              <span className="text-muted-foreground block">Destination:</span>
              <p className="font-semibold text-foreground">{order.customerName}</p>
              <p className="text-muted-foreground">
                {order.address}, {order.area}, {order.district}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground block">Payment & Charge:</span>
              <p className="font-semibold text-foreground">
                Total: ${Number(order.total).toFixed(2)} ({order.paymentMethod})
              </p>
              <p className="text-muted-foreground">
                Payment Status: <strong className="text-foreground">{order.paymentStatus}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Visual Tracking Timeline */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xs space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Delivery Milestones
          </h3>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-border">
            {statusSteps.map((step, idx) => (
              <div key={idx} className="relative">
                <div
                  className={`absolute -left-6 top-0 flex size-5 items-center justify-center rounded-full ring-4 ring-card ${
                    step.completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="size-3" />
                </div>

                <div className="space-y-0.5">
                  <p
                    className={`text-sm font-bold ${
                      step.completed ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs">
          <span className="text-muted-foreground">
            Questions about your shipment? Contact our 24/7 customer helpline.
          </span>
          <Button size="sm" variant="outline" asChild className="rounded-xl text-xs">
            <Link href="/contact">Support Center</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
