import { type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminCursorEffect } from "@/components/admin/admin-cursor-effect";
import { AdminSidebarProvider } from "@/components/admin/admin-sidebar-context";
import { AdminSidebarToggle } from "@/components/admin/admin-sidebar-toggle";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import { AdminNotifications } from "@/components/admin/admin-notifications";
import { AdminUserNav } from "@/components/admin/admin-user-nav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Portal — haqplus",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSidebarProvider>
      <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-muted/20 text-foreground relative">
        {/* Interactive Admin Cursor Effect */}
        <AdminCursorEffect />

        {/* Fixed Admin Sidebar */}
        <AdminSidebar />

        {/* Main Admin Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Topbar Header matching TailAdmin layout */}
          <header className="h-16 shrink-0 border-b border-border/80 bg-background/95 backdrop-blur-sm px-3 sm:px-6 flex items-center justify-between z-10 gap-2 sm:gap-4">
            {/* Left Section: Sidebar Toggle & Command Palette Search */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <AdminSidebarToggle />
              <AdminCommandPalette />
            </div>

            {/* Right Section: Theme Switcher, Notifications & Profile Nav */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <AdminThemeToggle />
              <AdminNotifications />
              <AdminUserNav />
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}


