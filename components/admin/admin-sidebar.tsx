"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Plug,
  ArrowLeft,
  ShoppingBag,
  FileText,
  ChevronDown,
  ListOrdered,
  PackageCheck,
  PlusCircle,
  X,
} from "lucide-react";
import { AdminSidebarSettings } from "./admin-sidebar-settings";
import { useAdminSidebar } from "./admin-sidebar-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, closeMobileSidebar } = useAdminSidebar();
  const [ordersSubmenuOpen, setOrdersSubmenuOpen] = useState(
    pathname.startsWith("/admin/orders") || pathname.startsWith("/admin/courier")
  );

  const isOrdersActive =
    pathname.startsWith("/admin/orders") || pathname.startsWith("/admin/courier");

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full bg-card border-r border-border/80 p-5 flex flex-col justify-between overflow-y-auto transition-all duration-300 shadow-2xl md:shadow-none md:static md:h-screen md:sticky md:top-0 shrink-0 ${
          isCollapsed
            ? "-translate-x-full md:translate-x-0 md:w-20"
            : "translate-x-0 w-72 md:w-64"
        }`}
      >
        <div className="space-y-6">
          {/* Admin Header Branding */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/admin"
              onClick={closeMobileSidebar}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm font-bold shrink-0">
                <ShoppingBag className="size-4" />
              </div>
              {(!isCollapsed || typeof window !== "undefined") && (
                <div className={`${isCollapsed ? "hidden md:hidden" : "block"} truncate`}>
                  <span className="text-base font-extrabold tracking-tight text-foreground truncate">
                    haqplus<span className="text-emerald-600 font-black"> Admin</span>
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600 -mt-1 truncate">
                    Tea Control Panel
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="md:hidden p-1.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation List */}
          <nav className="space-y-1">
            {/* Overview */}
            <Link
              href="/admin"
              onClick={closeMobileSidebar}
              title="Overview"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname === "/admin"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="size-4 shrink-0" />
              <span className={isCollapsed ? "md:hidden truncate" : "truncate"}>Overview</span>
            </Link>

            {/* Products */}
            <Link
              href="/admin/products"
              onClick={closeMobileSidebar}
              title="Products"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname.startsWith("/admin/products")
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Package className="size-4 shrink-0" />
              <span className={isCollapsed ? "md:hidden truncate" : "truncate"}>Products</span>
            </Link>

            {/* Categories */}
            <Link
              href="/admin/categories"
              onClick={closeMobileSidebar}
              title="Categories"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname.startsWith("/admin/categories")
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Layers className="size-4 shrink-0" />
              <span className={isCollapsed ? "md:hidden truncate" : "truncate"}>Categories</span>
            </Link>

            {/* ORDERS MAIN MENU WITH 2 SUBMENUS */}
            <div className="space-y-0.5">
              <button
                onClick={() => setOrdersSubmenuOpen(!ordersSubmenuOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isOrdersActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-4 shrink-0" />
                  <span className={isCollapsed ? "md:hidden truncate" : "truncate"}>Orders</span>
                </div>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    ordersSubmenuOpen ? "rotate-180" : ""
                  } ${isCollapsed ? "hidden md:hidden" : "block"}`}
                />
              </button>

              {/* Submenus */}
              {ordersSubmenuOpen && (
                <div className={`pl-4 pr-1 py-1 space-y-1 border-l-2 border-emerald-500/30 ml-4 animate-in slide-in-from-top-1 duration-150 ${isCollapsed ? "md:hidden" : "block"}`}>
    {/* Submenu 1: New Order / Create Order */}
                  <Link
                    href="/admin/orders/new"
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      pathname === "/admin/orders/new"
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <PlusCircle className="size-3.5 shrink-0" />
                    <span className="truncate">1. New Order </span>
                  </Link>

                  {/* Submenu 2: Pre-Confirm Order List*/}
                  <Link
                    href="/admin/orders"
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      pathname === "/admin/orders"
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <ListOrdered className="size-3.5 shrink-0" />
                    <span className="truncate">2. Order List </span>
                  </Link>

                  {/* Submenu 3: Courier Real Updates / Post-Confirm (Image 2) */}
                  <Link
                    href="/admin/courier"
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      pathname.startsWith("/admin/courier")
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <PackageCheck className="size-3.5 shrink-0" />
                    <span className="truncate">3. Courier Real Updates </span>
                  </Link>

              
                </div>
              )}
            </div>

            {/* Landing Pages */}
            <Link
              href="/admin/landing"
              onClick={closeMobileSidebar}
              title="Landing Pages"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname.startsWith("/admin/landing")
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <FileText className="size-4 shrink-0" />
              <span className={isCollapsed ? "md:hidden truncate" : "truncate"}>Landing Pages</span>
            </Link>

            {/* Customers */}
            <Link
              href="/admin/customers"
              onClick={closeMobileSidebar}
              title="Customers"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname.startsWith("/admin/customers")
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Users className="size-4 shrink-0" />
              <span className={isCollapsed ? "md:hidden truncate" : "truncate"}>Customers</span>
            </Link>

            {/* API */}
            <Link
              href="/admin/api"
              onClick={closeMobileSidebar}
              title="API"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname.startsWith("/admin/api")
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Plug className="size-4 shrink-0" />
              <span className={isCollapsed ? "md:hidden truncate" : "truncate"}>API Integration</span>
            </Link>

            {/* Interactive Collapsible Settings Tree */}
            <div className={`pt-2 ${isCollapsed ? "md:hidden" : "block"}`}>
              <AdminSidebarSettings
                isCompact={isCollapsed}
                onToggleCompact={toggleSidebar}
              />
            </div>
          </nav>
        </div>

        <div className="pt-6 border-t border-border/60">
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className={isCollapsed ? "md:hidden" : "block"}>Exit to Storefront</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

