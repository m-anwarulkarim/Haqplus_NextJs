"use client";

import { Printer, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceItem {
  id: string;
  productName: string;
  variantId?: string | null;
  quantity: number;
  price: number;
}

interface InvoiceProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    email?: string | null;
    division: string;
    district: string;
    area: string;
    address: string;
    subtotal: number;
    discount: number;
    shippingCharge: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    courierTrackingId?: string | null;
    createdAt: string | Date;
    items: InvoiceItem[];
  };
}

export function InvoiceView({ order }: InvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="flex items-center justify-between print:hidden">
        <span className="text-xs text-muted-foreground">
          Official Sales Invoice & Packing Slip
        </span>
        <Button onClick={handlePrint} className="rounded-xl shadow-xs gap-2">
          <Printer className="size-4" />
          <span>Print / Save as PDF</span>
        </Button>
      </div>

      {/* Invoice Document Box */}
      <div className="bg-card text-foreground rounded-2xl border border-border/80 p-8 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border/80 pb-6 print:border-neutral-300">
          <div>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Leaf className="size-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                haq<span className="text-emerald-600 font-black">plus</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground print:text-neutral-600">
              Premium Sreemangal & Sylhet Garden Tea
            </p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">
              Sreemangal, Moulvibazar & Dhaka, Bangladesh
            </p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">
              Helpline: +880 1700-000000 | support@haqplus.com
            </p>
          </div>

          <div className="sm:text-right">
            <h2 className="text-2xl font-black uppercase tracking-wider text-primary print:text-black">
              INVOICE
            </h2>
            <div className="mt-1 space-y-0.5 text-xs text-muted-foreground print:text-neutral-700">
              <p>
                Invoice #:{" "}
                <strong className="text-foreground print:text-black font-mono">
                  {order.orderNumber}
                </strong>
              </p>
              <p>Date: {formattedDate}</p>
              <p>
                Payment:{" "}
                <span className="font-semibold text-foreground print:text-black">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </p>
              {order.courierTrackingId && (
                <p>
                  Steadfast Tracking:{" "}
                  <strong className="font-mono text-primary print:text-black">
                    {order.courierTrackingId}
                  </strong>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Ship To Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground print:text-neutral-500">
              Customer & Delivery Address
            </span>
            <div className="mt-1 space-y-1">
              <p className="font-bold text-sm text-foreground print:text-black">
                {order.customerName}
              </p>
              <p className="font-mono text-muted-foreground print:text-neutral-700">
                Phone: {order.phone}
              </p>
              {order.email && (
                <p className="text-muted-foreground print:text-neutral-700">
                  Email: {order.email}
                </p>
              )}
              <p className="text-muted-foreground print:text-neutral-700 mt-1">
                {order.address}, {order.area}
              </p>
              <p className="font-medium text-foreground print:text-black">
                {order.district}, {order.division}, Bangladesh
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground print:text-neutral-500">
              Order Status & Fulfillment
            </span>
            <div className="mt-1 space-y-1">
              <p>
                Status:{" "}
                <span className="font-bold px-2 py-0.5 rounded-md bg-muted text-foreground print:border print:border-neutral-300">
                  {order.orderStatus}
                </span>
              </p>
              <p className="text-muted-foreground print:text-neutral-700">
                Delivery Provider: Steadfast Courier
              </p>
              <p className="text-muted-foreground print:text-neutral-700">
                Delivery Destination: {order.district} ({order.division})
              </p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="rounded-xl border border-border/80 overflow-hidden my-6 print:border-neutral-300">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 print:bg-neutral-100 print:border-neutral-300">
              <tr>
                <th className="py-2.5 px-4 font-semibold text-muted-foreground print:text-neutral-700">
                  Item Description
                </th>
                <th className="py-2.5 px-4 font-semibold text-muted-foreground print:text-neutral-700 text-center">
                  Qty
                </th>
                <th className="py-2.5 px-4 font-semibold text-muted-foreground print:text-neutral-700 text-right">
                  Unit Price
                </th>
                <th className="py-2.5 px-4 font-semibold text-muted-foreground print:text-neutral-700 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 print:divide-neutral-200">
              {order.items.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <tr key={item.id}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground print:text-black">
                        {item.productName}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono">৳{item.price}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      ৳{lineTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-border/80 pt-4 print:border-neutral-300">
          <div className="text-xs text-muted-foreground print:text-neutral-600 max-w-xs space-y-1">
            <p className="font-semibold text-foreground print:text-black">Return Policy:</p>
            <p>
              Inspect package upon delivery. In case of discrepancies or damaged items, contact our
              support within 7 days.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground print:text-neutral-700">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">৳{order.subtotal}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 print:text-neutral-700">
                <span>Discount / Promo:</span>
                <span className="font-mono font-medium">-৳{order.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground print:text-neutral-700">
              <span>Delivery Charge ({order.district === "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"}):</span>
              <span className="font-mono font-medium">৳{order.shippingCharge}</span>
            </div>

            <div className="border-t border-border/80 pt-2 flex justify-between font-bold text-sm text-foreground print:text-black print:border-neutral-300">
              <span>Grand Total:</span>
              <span className="font-mono text-primary print:text-black">৳{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signature Section */}
        <div className="mt-12 pt-8 border-t border-dashed border-border/80 flex justify-between items-end text-xs text-muted-foreground print:border-neutral-300 print:text-neutral-500">
          <div>
            <p>Thank you for shopping with haqplus!</p>
            <p className="text-[10px] mt-0.5">Computer-generated invoice. No physical seal required.</p>
          </div>

          <div className="text-center">
            <div className="w-36 border-b border-muted-foreground/40 mb-1 print:border-black"></div>
            <p className="text-[10px] uppercase tracking-wider font-semibold">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
