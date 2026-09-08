"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Palette,
  Globe2,
  MousePointer2,
  Code2,
  Keyboard,
  Sun,
  Moon,
  Laptop,
  Check,
  Ban,
  X,
  Sparkles,
  SlidersHorizontal,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { CursorEffectType } from "./admin-cursor-effect";

const CURSOR_STORAGE_KEY = "admin_cursor_effect";
const THEME_STORAGE_KEY = "theme";
const LANG_STORAGE_KEY = "admin_language";

export function AdminSidebarSettings({
  onToggleCompact,
  isCompact,
}: {
  onToggleCompact?: () => void;
  isCompact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Active Modals & States
  const [activeModal, setActiveModal] = useState<
    "theme" | "language" | "cursor" | "menu" | "shortcuts" | null
  >(null);

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark");
  const [language, setLanguage] = useState<"en" | "bn">("bn");
  const [cursorEffect, setCursorEffect] = useState<CursorEffectType>("neon-glow");

  const applyTheme = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else if (mode === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  };

  // Load Saved Preferences
  useEffect(() => {
    // Theme
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as any) || "dark";
    setThemeMode(savedTheme);
    applyTheme(savedTheme);

    // Language
    const savedLang = (localStorage.getItem(LANG_STORAGE_KEY) as any) || "bn";
    setLanguage(savedLang);

    // Cursor
    const savedCursor = (localStorage.getItem(CURSOR_STORAGE_KEY) as any) || "neon-glow";
    setCursorEffect(savedCursor);
  }, []);

  const handleLanguageChange = (lang: "en" | "bn") => {
    setLanguage(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    toast.success(lang === "bn" ? "ভাষা বাংলা নির্বাচন করা হয়েছে" : "Language set to English");
    setActiveModal(null);
  };

  const handleCursorChange = (effect: CursorEffectType) => {
    setCursorEffect(effect);
    localStorage.setItem(CURSOR_STORAGE_KEY, effect);
    window.dispatchEvent(new Event("admin_cursor_change"));

    const labels: Record<CursorEffectType, string> = {
      "neon-glow": "✨ Neon Glow",
      "bubble-trail": "🫧 Bubble Trail",
      "spotlight-torch": "🔦 Spotlight Torch",
      "galaxy-dust": "🌌 Galaxy Dust",
      "product-orbit": "🛍️ Product Orbit",
      disabled: "🚫 Disabled",
    };
    toast.success(`Cursor Effect: ${labels[effect]}`);
    setActiveModal(null);
  };

  return (
    <div className="space-y-1">
      {/* Accordion Header */}
      <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-foreground bg-muted/40 hover:bg-muted dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-border dark:border-slate-800 transition">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 flex-1 hover:text-emerald-500 transition-colors"
        >
          <Settings className="size-4 text-emerald-500" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition"
          title="Toggle Quick Settings"
        >
          {isOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </div>

      {/* Accordion Child Tree */}
      {isOpen && (
        <div className="ml-4 pl-3 border-l-2 border-border dark:border-slate-700/80 space-y-1 pt-1 animate-in fade-in duration-150">
          {/* Full Settings Page Link */}
          <Link
            href="/admin/settings"
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 transition"
          >
            <SlidersHorizontal className="size-4 text-emerald-500 shrink-0" />
            <span>Settings Page</span>
          </Link>

          {/* Cursor Effect Option */}
          <button
            onClick={() => setActiveModal("cursor")}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-slate-800/80 transition"
          >
            <Box className="size-4 text-amber-500 shrink-0" />
            <span>Cursor Effect</span>
          </button>

          {/* Theme Option */}
          <button
            onClick={() => setActiveModal("theme")}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-slate-800/80 transition"
          >
            <Palette className="size-4 text-pink-500 shrink-0" />
            <span>Theme</span>
          </button>

          {/* Language Option */}
          <button
            onClick={() => setActiveModal("language")}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-slate-800/80 transition"
          >
            <Globe2 className="size-4 text-cyan-400 shrink-0" />
            <span>Language</span>
          </button>

          {/* Cursor Effect Option */}
<button
  onClick={() => setActiveModal("cursor")}
  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-slate-800/80 transition"
>
  <Box className="size-4 text-amber-500 shrink-0" />
  <span>Cursor Effect</span>
</button>

{/* Bubble Trail Preview Option */}
<button
  onClick={() => {
    handleCursorChange('bubble-trail');
    setTimeout(() => handleCursorChange(cursorEffect), 3000);
  }}
  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-slate-800/80 transition"
>
  <Box className="size-4 text-amber-500 shrink-0" />
  <span>Bubble Trail Preview</span>
</button>


        </div>
      )}

      {/* 1. Theme Modal */}
      {activeModal === "theme" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card dark:bg-[#161b22] border border-border dark:border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Palette className="size-4 text-pink-500" />
                <span>Select Portal Theme</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs font-semibold">
              <button
                onClick={() => applyTheme("light")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                  themeMode === "light"
                    ? "bg-pink-500/15 border-pink-500 text-pink-600 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Sun className="size-5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                onClick={() => applyTheme("dark")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                  themeMode === "dark"
                    ? "bg-pink-500/15 border-pink-500 text-pink-400 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Moon className="size-5 text-indigo-400" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => applyTheme("system")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                  themeMode === "system"
                    ? "bg-pink-500/15 border-pink-500 text-pink-400 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Laptop className="size-5 text-emerald-400" />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Language Modal */}
      {activeModal === "language" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card dark:bg-[#161b22] border border-border dark:border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe2 className="size-4 text-cyan-400" />
                <span>Select Admin Language</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <button
                onClick={() => handleLanguageChange("bn")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  language === "bn"
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-500 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>🇧🇩 বাংলা (Bengali)</span>
                {language === "bn" && <Check className="size-4" />}
              </button>

              <button
                onClick={() => handleLanguageChange("en")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  language === "en"
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-500 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>🇺🇸 English (US)</span>
                {language === "en" && <Check className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cursor Effect Modal */}
      {activeModal === "cursor" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card dark:bg-[#161b22] border border-border dark:border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MousePointer2 className="size-4 text-emerald-400" />
                <span>Dashboard Cursor Effect Style</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <button
                onClick={() => handleCursorChange("neon-glow")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  cursorEffect === "neon-glow"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-foreground">✨ 1. Neon Glow</p>
                  <p className="text-[11px] text-muted-foreground font-normal">স্মুথ নিয়ন স্পার্কল ট্রেইল অ্যানিমেশন</p>
                </div>
                {cursorEffect === "neon-glow" && <Check className="size-4 text-emerald-500" />}
              </button>

              <button
                onClick={() => handleCursorChange("bubble-trail")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  cursorEffect === "bubble-trail"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-foreground">🫧 2. Bubble Trail</p>
                  <p className="text-[11px] text-muted-foreground font-normal">মাউসের পেছনে ফ্লোটিং বাবুল পার্টিকেল কণা</p>
                </div>
                {cursorEffect === "bubble-trail" && <Check className="size-4 text-emerald-500" />}
              </button>

              <button
                onClick={() => handleCursorChange("spotlight-torch")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  cursorEffect === "spotlight-torch"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-foreground">🔦 3. Spotlight Torch</p>
                  <p className="text-[11px] text-muted-foreground font-normal">রেডিয়াল টর্চ স্পটলাইট ফোকাস লাইটিং</p>
                </div>
                {cursorEffect === "spotlight-torch" && <Check className="size-4 text-emerald-500" />}
              </button>

              <button
                onClick={() => handleCursorChange("galaxy-dust")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  cursorEffect === "galaxy-dust"
                    ? "bg-purple-500/15 border-purple-500 text-purple-400 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-foreground">🌌 4. Galaxy Dust</p>
                  <p className="text-[11px] text-muted-foreground font-normal">কসমিক স্টারডাস্ট স্পাইরাল পার্টিকেল ইফেক্ট</p>
                </div>
                {cursorEffect === "galaxy-dust" && <Check className="size-4 text-purple-400" />}
              </button>

              <button
                onClick={() => handleCursorChange("product-orbit")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  cursorEffect === "product-orbit"
                    ? "bg-[#CBB8DB]/15 border-[#CBB8DB] text-[#CBB8DB] font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-foreground">🛍️ 5. Product Orbit</p>
                  <p className="text-[11px] text-muted-foreground font-normal">প্রোডাক্ট ইমেজ অরবিট ফ্লোটিং ইফেক্ট</p>
                </div>
                {cursorEffect === "product-orbit" && <Check className="size-4 text-[#CBB8DB]" />}
              </button>              <button
                onClick={() => handleCursorChange("disabled")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  cursorEffect === "disabled"
                    ? "bg-rose-500/15 border-rose-500 text-rose-500 font-bold"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-foreground">🚫 Disabled</p>
                  <p className="text-[11px] text-muted-foreground font-normal">স্বাভাবিক মাউস কার্সার পয়েন্টার</p>
                </div>
                {cursorEffect === "disabled" && <Check className="size-4 text-rose-500" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Keyboard Shortcuts Modal */}
      {activeModal === "shortcuts" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card dark:bg-[#161b22] border border-border dark:border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Keyboard className="size-4 text-indigo-400" />
                <span>Admin Keyboard Shortcuts</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border">
                <span className="text-muted-foreground font-sans">Quick Orders Search</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border text-foreground font-bold">Ctrl + K</kbd>
              </div>

              <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border">
                <span className="text-muted-foreground font-sans">Toggle Dark/Light Mode</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border text-foreground font-bold">Ctrl + D</kbd>
              </div>

              <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border">
                <span className="text-muted-foreground font-sans">Open Landing Pages</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border text-foreground font-bold">Ctrl + L</kbd>
              </div>

              <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border">
                <span className="text-muted-foreground font-sans">Save Active Order</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border text-foreground font-bold">Ctrl + S</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
