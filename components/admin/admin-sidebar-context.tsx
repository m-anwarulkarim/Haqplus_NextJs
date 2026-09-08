"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminSidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
  closeMobileSidebar: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
  setIsCollapsed: () => {},
  closeMobileSidebar: () => {},
});

const STORAGE_KEY = "admin_sidebar_collapsed";

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768) {
          setIsCollapsedState(true);
        } else {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved !== null) {
            setIsCollapsedState(JSON.parse(saved));
          }
        }
      }
    } catch (e) {
      // Ignore SSR / localStorage errors
    }
  }, []);

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    try {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
      }
    } catch (e) {}
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsCollapsedState(true);
    }
  };

  return (
    <AdminSidebarContext.Provider
      value={{ isCollapsed, toggleSidebar, setIsCollapsed, closeMobileSidebar }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}

