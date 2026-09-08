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
import {
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export function AdminUserNav() {
  const { data: session } = useSession();

  const user = session?.user || {
    name: "Anwarul Karim",
    email: "admin@haqplus.com",
    image: null,
    role: "ADMIN",
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AK";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-border/80 bg-background hover:bg-muted/60 transition-all outline-none cursor-pointer shadow-xs">
          <Avatar className="size-8">
            {user.image && <AvatarImage src={user.image} alt={user.name || "Admin"} />}
            <AvatarFallback className="bg-blue-600 text-white text-xs font-extrabold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-foreground hidden sm:inline-block max-w-[120px] truncate">
            {user.name || "Admin"}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2 shadow-2xl border-border/80 rounded-2xl">
        <div className="px-2 py-2 font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground truncate">
                {user.name || "Admin User"}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <ShieldCheck className="size-3" />
                ADMIN
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={(props) => (
            <Link href="/admin" {...props} className="flex items-center gap-2 font-medium cursor-pointer">
              <LayoutDashboard className="size-4 text-blue-500" />
              <span>Admin Control Panel</span>
            </Link>
          )} />
          <DropdownMenuItem render={(props) => (
            <Link href="/account" {...props} className="flex items-center gap-2 cursor-pointer">
              <UserIcon className="size-4 text-muted-foreground" />
              <span>My Profile Settings</span>
            </Link>
          )} />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer flex items-center gap-2 font-semibold"
        >
          <LogOut className="size-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
