"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { toast } from "@/components/ui/toast";

const THEME_STORAGE_KEY = "theme";

export function AdminThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default dark
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      toast.success("Switched to Dark Theme 🌙");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Switched to Light Theme ☀️");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="flex size-9 items-center justify-center rounded-full border border-border/80 bg-background text-foreground hover:bg-muted/80 hover:border-border transition-all cursor-pointer shadow-xs active:scale-95"
    >
      {theme === "dark" ? (
        <Sun className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4 text-slate-700" />
      )}
    </button>
  );
}
