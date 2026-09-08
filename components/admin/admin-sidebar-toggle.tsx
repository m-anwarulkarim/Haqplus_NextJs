"use client";

import { PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAdminSidebar } from "./admin-sidebar-context";

export function AdminSidebarToggle({ className = "" }: { className?: string }) {
  const { isCollapsed, toggleSidebar } = useAdminSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      title={isCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
      className={`inline-flex items-center justify-center p-2 rounded-xl bg-purple-600/20 text-purple-400 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs ${className}`}
    >
      <PanelLeft className="size-5 transition-transform duration-200 group-hover:scale-105" />
    </button>
  );
}
