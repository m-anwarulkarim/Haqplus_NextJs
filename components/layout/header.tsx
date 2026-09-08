"use client";

import Link from "next/link";
import { ShoppingBag, Flame, Leaf, Coffee, Sparkles, ChevronDown } from "lucide-react";
import { useCartStore, useCartHydration } from "@/lib/store/cart-store";
import { SearchBar } from "./search-bar";
import { UserNav } from "./user-nav";
import { MobileNav } from "./mobile-nav";
import { CartSheet } from "@/components/cart/cart-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const hasHydrated = useCartHydration();
  const { getTotalItems, setIsOpen } = useCartStore();
  const totalItems = hasHydrated ? getTotalItems() : 0;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 transition-all">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left: Mobile Nav Trigger & Brand Logo */}
          <div className="flex items-center gap-3">
            <MobileNav />

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 transition-transform duration-200 group-hover:scale-105">
                <Leaf className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-foreground">
                  haq<span className="text-emerald-600 font-black">plus</span>
                </span>
                <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-widest text-muted-foreground -mt-1">
                  Pure Organic Tea
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
            >
            All Products
            </Link>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(props) => (
                  <button
                    {...props}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium text-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors outline-none cursor-pointer"
                  >
                    <span>Categories</span>
                    <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                )}
              />
              <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl shadow-xl">
                <DropdownMenuItem render={(props) => (
                  <Link href="/category/black-tea" {...props} className="flex items-center gap-2.5 cursor-pointer">
                    <Coffee className="size-4 text-amber-700" />
                    <span>Black Tea</span>
                  </Link>
                )} />
                <DropdownMenuItem render={(props) => (
                  <Link href="/category/green-tea" {...props} className="flex items-center gap-2.5 cursor-pointer">
                    <Leaf className="size-4 text-emerald-600" />
                    <span>Green Tea</span>
                  </Link>
                )} />
                <DropdownMenuItem render={(props) => (
                  <Link href="/category/masala-chai" {...props} className="flex items-center gap-2.5 cursor-pointer">
                    <Sparkles className="size-4 text-orange-600" />
                    <span>Masala Chai</span>
                  </Link>
                )} />
                <DropdownMenuItem render={(props) => (
                  <Link href="/category/herbal-tea" {...props} className="flex items-center gap-2.5 cursor-pointer">
                    <Leaf className="size-4 text-lime-600" />
                    <span> Herbal Tea</span>
                  </Link>
                )} />
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/deals"
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-foreground hover:text-orange-600 hover:bg-orange-500/10 transition-colors"
            >
              <Flame className="size-4 text-orange-500 animate-pulse" />
              <span>স্পেশাল অফার</span>
              <span className="rounded-full bg-orange-500/15 px-1.5 py-0.2 text-[10px] font-bold text-orange-600">
                ছাড়ে কিনুন
              </span>
            </Link>

            <Link
              href="/about"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
            >
              আমাদের গল্প
            </Link>

            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
            >
              যোগাযোগ
            </Link>
          </nav>

          {/* Center / Right: Interactive Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs xl:max-w-sm justify-center">
            <SearchBar />
          </div>

          {/* Right Action Icons: Cart & User Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Trigger with reactive badge */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative flex size-10 items-center justify-center rounded-full border border-border/80 bg-background hover:bg-muted/60 hover:text-emerald-600 hover:ring-2 hover:ring-emerald-500/20 transition-all outline-none cursor-pointer"
              aria-label={`View cart with ${totalItems} items`}
            >
              <ShoppingBag className="size-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white shadow-sm animate-in zoom-in-50 duration-200">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* User Account Navigation */}
            <UserNav />
          </div>
        </div>
      </header>

      {/* Slide-over Cart Drawer */}
      <CartSheet />
    </>
  );
}
