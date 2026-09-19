"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Palette,
  Globe2,
  MousePointer2,
  Sun,
  Moon,
  Laptop,
  Check,
  Ban,
  Sparkles,
  Plug,
  Clock,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { type CursorEffectType } from "@/components/admin/admin-cursor-effect";

const CURSOR_STORAGE_KEY = "admin_cursor_effect";
const THEME_STORAGE_KEY = "theme";
const LANG_STORAGE_KEY = "admin_language";

export default function AdminSettingsPage() {
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system" | "bubble">("dark");
  const [language, setLanguage] = useState<"en" | "bn">("bn");
  const [cursorEffect, setCursorEffect] = useState<CursorEffectType>("neon-glow");
  const [orderDelayMinutes, setOrderDelayMinutes] = useState<number>(0);
  const [isSavingDelay, setIsSavingDelay] = useState(false);

  useEffect(() => {
    // Theme
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as any) || "dark";
    setThemeMode(savedTheme);

    // Language
    const savedLang = (localStorage.getItem(LANG_STORAGE_KEY) as any) || "bn";
    setLanguage(savedLang);

    // Cursor
    const savedCursor = (localStorage.getItem(CURSOR_STORAGE_KEY) as any) || "neon-glow";
    setCursorEffect(savedCursor);

    // Fetch order delay setting
    fetch("/api/settings/order-delay")
      .then((res) => res.json())
      .then((data) => {
        if (data.delayMinutes !== undefined) {
          setOrderDelayMinutes(data.delayMinutes);
        }
      })
      .catch((err) => console.error("Failed to fetch order delay", err));
  }, []);

  const applyTheme = (mode: "light" | "dark" | "system" | "bubble") => {
    setThemeMode(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    document.documentElement.classList.remove("dark", "theme-bubble");

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else if (mode === "bubble") {
      document.documentElement.classList.add("theme-bubble");
    } else if (mode === "light") {
      // light mode has no classes by default
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.classList.add("dark");
    }
    toast.success(`Theme set to ${mode.toUpperCase()}`);
  };

  const handleLanguageChange = (lang: "en" | "bn") => {
    setLanguage(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    toast.success(lang === "bn" ? "ভাষা বাংলা নির্বাচন করা হয়েছে" : "Language set to English");
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
    toast.success(`Cursor Effect active: ${labels[effect]}`);
  };

  const saveOrderDelay = async () => {
    setIsSavingDelay(true);
    try {
      const res = await fetch("/api/settings/order-delay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delayMinutes: orderDelayMinutes }),
      });
      if (res.ok) {
        toast.success("Order delay setting saved successfully");
      } else {
        toast.error("Failed to save order delay");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSavingDelay(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#CBB8DB]/20 text-[#7C5A9C] dark:text-[#CBB8DB] border border-[#CBB8DB]/40 px-3 py-0.5 text-xs font-bold mb-1">
          <Settings className="size-3.5" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Admin Portal Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize portal themes, cursor magic effects, language preferences, keyboard shortcuts, and layout controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Theme Preferences */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center shrink-0">
              <Palette className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Portal Theme Mode</h3>
              <p className="text-xs text-muted-foreground">Select Light, Dark, or System Sync mode.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => applyTheme("light")}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                themeMode === "light"
                  ? "bg-pink-500/15 border-pink-500 text-pink-600 font-bold shadow-xs scale-102"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Sun className="size-6 text-amber-500" />
              <span className="text-xs font-bold">Light</span>
              {themeMode === "light" && <Check className="size-4 text-pink-500 mt-1" />}
            </button>

            <button
              onClick={() => applyTheme("dark")}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                themeMode === "dark"
                  ? "bg-pink-500/15 border-pink-500 text-pink-500 font-bold shadow-xs scale-102"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Moon className="size-6 text-cyan-400" />
              <span className="text-xs font-bold">Dark</span>
              {themeMode === "dark" && <Check className="size-4 text-pink-500 mt-1" />}
            </button>

            <button
              onClick={() => applyTheme("system")}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                themeMode === "system"
                  ? "bg-pink-500/15 border-pink-500 text-pink-500 font-bold shadow-xs scale-102"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Laptop className="size-6 text-emerald-400" />
              <span className="text-xs font-bold">System</span>
              {themeMode === "system" && <Check className="size-4 text-pink-500 mt-1" />}
            </button>

            <button
              onClick={() => applyTheme("bubble")}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                themeMode === "bubble"
                  ? "bg-blue-500/15 border-blue-500 text-blue-500 font-bold shadow-xs scale-102"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="size-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              <span className="text-xs font-bold text-blue-500">Bubble Trail</span>
              {themeMode === "bubble" && <Check className="size-4 text-blue-500 mt-1" />}
            </button>
          </div>
        </div>

        {/* CARD 2: Cursor Effects */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <MousePointer2 className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Interactive Cursor Effects</h3>
              <p className="text-xs text-muted-foreground">Select interactive particle & glow effects for mouse movement.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={() => handleCursorChange("neon-glow")}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                cursorEffect === "neon-glow"
                  ? "bg-emerald-500/15 border-emerald-500 text-foreground font-bold"
                  : "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="size-4 text-emerald-400" />
                <span>Neon Glow</span>
              </div>
              {cursorEffect === "neon-glow" && <Check className="size-4 text-emerald-500" />}
            </button>

            <button
              onClick={() => handleCursorChange("bubble-trail")}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                cursorEffect === "bubble-trail"
                  ? "bg-emerald-500/15 border-emerald-500 text-foreground font-bold"
                  : "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="size-4 text-blue-400" />
                <span>Bubble Trail</span>
              </div>
              {cursorEffect === "bubble-trail" && <Check className="size-4 text-emerald-500" />}
            </button>

            <button
              onClick={() => handleCursorChange("spotlight-torch")}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                cursorEffect === "spotlight-torch"
                  ? "bg-emerald-500/15 border-emerald-500 text-foreground font-bold"
                  : "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="size-4 text-amber-400" />
                <span>Spotlight Torch</span>
              </div>
              {cursorEffect === "spotlight-torch" && <Check className="size-4 text-emerald-500" />}
            </button>

            <button
              onClick={() => handleCursorChange("galaxy-dust")}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                cursorEffect === "galaxy-dust"
                  ? "bg-purple-500/15 border-purple-500 text-foreground font-bold"
                  : "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="size-4 text-purple-400" />
                <span>Galaxy Dust</span>
              </div>
              {cursorEffect === "galaxy-dust" && <Check className="size-4 text-purple-400" />}
            </button>

            <button
              onClick={() => handleCursorChange("product-orbit")}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                cursorEffect === "product-orbit"
                  ? "bg-[#CBB8DB]/15 border-[#CBB8DB] text-foreground font-bold"
                  : "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="size-4 text-[#CBB8DB]" />
                <span>Product Orbit</span>
              </div>
              {cursorEffect === "product-orbit" && <Check className="size-4 text-[#CBB8DB]" />}
            </button>
            <button
              onClick={() => handleCursorChange("disabled")}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                cursorEffect === "disabled"
                  ? "bg-rose-500/15 border-rose-500 text-rose-500 font-bold"
                  : "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Ban className="size-4 text-rose-500" />
                <span>Disabled</span>
              </div>
              {cursorEffect === "disabled" && <Check className="size-4 text-rose-500" />}
            </button>
          </div>
        </div>

        {/* CARD 3: Language */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
              <Globe2 className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Language / ভাষা</h3>
              <p className="text-xs text-muted-foreground">Select preferred admin language interface.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleLanguageChange("bn")}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                language === "bn"
                  ? "bg-cyan-500/15 border-cyan-500 text-foreground font-bold"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🇧🇩</span>
                <span className="text-xs font-bold">বাংলা (Bengali)</span>
              </div>
              {language === "bn" && <Check className="size-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => handleLanguageChange("en")}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                language === "en"
                  ? "bg-cyan-500/15 border-cyan-500 text-foreground font-bold"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🇺🇸</span>
                <span className="text-xs font-bold">English</span>
              </div>
              {language === "en" && <Check className="size-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* CARD 3.5: Order Frequency */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Order Frequency Limit</h3>
              <p className="text-xs text-muted-foreground">Set wait time between orders (0 to disable).</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                value={orderDelayMinutes}
                onChange={(e) => setOrderDelayMinutes(Number(e.target.value))}
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                placeholder="Minutes"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                minutes
              </span>
            </div>
            <Button
              onClick={saveOrderDelay}
              disabled={isSavingDelay}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              {isSavingDelay ? (
                "Saving..."
              ) : (
                <>
                  <Save className="size-4 mr-1.5" /> Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* CARD 4: API & Gateways Quick Link */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-500/15 text-[#CBB8DB] flex items-center justify-center shrink-0">
                <Plug className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">API & Gateways Manager</h3>
                <p className="text-xs text-muted-foreground">Configure Courier (Steadfast), SMS, Fraud Checker & Meta Pixel.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All external API credentials and SMS notifications templates are managed cleanly under the unified API Integration Hub.
            </p>
          </div>

          <Link href="/admin/api">
            <Button className="w-full rounded-xl bg-[#CBB8DB] hover:bg-[#b59ece] text-slate-950 font-bold gap-2 cursor-pointer shadow-xs">
              <Plug className="size-4" />
              <span>Open API Integration Center</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
