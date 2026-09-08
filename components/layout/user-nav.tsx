"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Package,
  Heart,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="size-9 rounded-full bg-muted/60 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild className="shadow-xs">
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const isAdmin = user.role === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={(props) => (
        <button
          {...props}
          className="relative flex size-9 items-center justify-center rounded-full border border-border/80 bg-background hover:ring-2 hover:ring-primary/20 transition-all outline-none"
        >
          <Avatar className="size-8">
            {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      )} />

      <DropdownMenuContent align="end" className="w-56 p-2 shadow-xl border-border/80 rounded-xl">
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none text-foreground truncate">
                {user.name || "User"}
              </p>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-3" />
                  ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="size-3" />
                  MEMBER
                </span>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isAdmin && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem render={(props) => (
                <Link
                  href="/admin"
                  {...props}
                  className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400 cursor-pointer"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )} />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem render={(props) => (
            <Link href="/account" {...props} className="flex items-center gap-2 cursor-pointer">
              <UserIcon className="size-4 text-muted-foreground" />
              <span>My Profile</span>
            </Link>
          )} />
          <DropdownMenuItem render={(props) => (
            <Link href="/account/orders" {...props} className="flex items-center gap-2 cursor-pointer">
              <Package className="size-4 text-muted-foreground" />
              <span>Order History</span>
            </Link>
          )} />
          <DropdownMenuItem render={(props) => (
            <Link href="/account/wishlist" {...props} className="flex items-center gap-2 cursor-pointer">
              <Heart className="size-4 text-muted-foreground" />
              <span>Saved Wishlist</span>
            </Link>
          )} />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer flex items-center gap-2"
        >
          <LogOut className="size-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
