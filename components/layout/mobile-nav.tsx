"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Leaf,
  Home,
  Tag,
  Flame,
  HelpCircle,
  Phone,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Coffee,
} from "lucide-react";
import { SearchBar } from "./search-bar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={(props) => (
          <Button
            variant="ghost"
            size="icon"
            {...props}
            className="md:hidden text-foreground"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="size-5" />
          </Button>
        )}
      />

      <SheetContent
        side="left"
        className="w-full sm:max-w-sm flex flex-col p-0 bg-background border-r border-border/80 shadow-2xl"
      >
        <SheetHeader className="p-5 border-b border-border/70 flex flex-row items-center justify-between">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-bold text-lg text-foreground tracking-tight"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Leaf className="size-4" />
            </div>
            <span>
              haq<span className="text-emerald-600 font-black">plus</span>
            </span>
          </Link>
          <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        </SheetHeader>

        {/* Mobile Search */}
        <div className="p-4 border-b border-border/50">
          <SearchBar />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
              মেনু (Menu)
            </p>
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Home className="size-4 text-emerald-600" />
                  <span>হোম (Home)</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Coffee className="size-4 text-emerald-600" />
                  <span>সকল চা (All Teas)</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/category/black-tea"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="size-4 text-amber-700" />
                  <span>ব্ল্যাক টি (Black Tea)</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/category/green-tea"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Leaf className="size-4 text-emerald-600" />
                  <span>গ্রিন টি (Green Tea)</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/category/masala-chai"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="size-4 text-orange-600" />
                  <span>রয়েল মসলা চা (Masala Chai)</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/deals"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Flame className="size-4 text-orange-500" />
                  <span>স্পেশাল অফার</span>
                </div>
                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                  ছাড়ে কিনুন
                </span>
              </Link>

              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="size-4 text-muted-foreground" />
                  <span>আমাদের সম্পর্কে</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>যোগাযোগ করুন</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Account Section */}
          <div className="border-t border-border/60 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
              অ্যাকাউন্ট
            </p>

            {session?.user ? (
              <div className="space-y-1">
                <div className="px-3 py-2 rounded-xl bg-muted/40 mb-2">
                  <p className="text-sm font-semibold text-foreground">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      ADMIN
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                  >
                    <LayoutDashboard className="size-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-3 pt-2">
                <Button
                  asChild
                  className="w-full rounded-xl"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full rounded-xl"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
