"use client";

import { Sparkles, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-xs font-medium tracking-wide">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
            <Sparkles className="size-3 text-amber-300 animate-pulse" />
            Special Offer
          </span>
          <span>
            Get 20% off your first order with code{" "}
            <span className="font-bold tracking-wider text-amber-300">WELCOME20</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-primary-foreground/90">
          <div className="flex items-center gap-1.5">
            <Truck className="size-3.5 text-primary-foreground/80" />
            <span>Free Express Shipping Over $75</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary-foreground/80" />
            <span>30-Day Money Back Guarantee</span>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-1 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            <span>Shop Now</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
