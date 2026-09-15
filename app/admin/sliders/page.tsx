"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  Check,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Flame,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

export interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  title: string;
  highlightText?: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  tagline?: string;
  isActive?: boolean;
}

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1600&auto=format&fit=crop&q=80",
];

export default function AdminSlidersPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<HeroSlide | null>(null);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/hero-sliders");
      if (res.ok) {
        const data = await res.json();
        setSlides(Array.isArray(data.slides) ? data.slides : []);
      }
    } catch (err) {
      console.error("Failed to load slides:", err);
      toast.error("Failed to fetch hero sliders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/hero-sliders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });

      if (!res.ok) {
        toast.error("Failed to save hero sliders");
        return;
      }

      toast.success("Hero slider banners saved successfully!");
      fetchSlides();
    } catch (err) {
      console.error(err);
      toast.error("Network error saving hero sliders");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSlide = (index: number, key: keyof HeroSlide, value: any) => {
    setSlides((prev) =>
      prev.map((slide, idx) => (idx === index ? { ...slide, [key]: value } : slide))
    );
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide_${Date.now()}`,
      image: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
      badge: "নতুন অফার ব্যাজ",
      title: "প্রতি চুমুতেই অনুভব করুন",
      highlightText: "খাঁটি অর্গানিক চা",
      description: "শ্রীমঙ্গলের ঐতিহ্যবাহী তাজা চা পাতা এখন বিশেষ মূল্যে সরাসরি আপনার কাছে।",
      primaryBtnText: "এখনই অর্ডার করুন",
      primaryBtnLink: "/shop",
      secondaryBtnText: "অফার দেখুন",
      secondaryBtnLink: "/deals",
      tagline: "২৪-৪৮ ঘণ্টার মধ্যে সারা দেশে ডেলিভারি",
      isActive: true,
    };
    setSlides((prev) => [...prev, newSlide]);
    toast.success("New hero slide added! Fill in the details below and click Save.");
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error("At least one slide must remain");
      return;
    }
    setSlides((prev) => prev.filter((_, idx) => idx !== index));
    toast.success("Slide removed");
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;

    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-3 py-0.5 text-xs font-bold mb-1">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Storefront Banner Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hero Slider & Banner Manager
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Edit text, titles, badges, CTA button links, and background images for the Homepage Hero Slider.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleAddSlide}
            variant="outline"
            size="sm"
            className="rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 font-bold gap-1.5 h-9"
          >
            <Plus className="size-4" />
            <span>Add New Slide</span>
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            size="sm"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm h-9"
          >
            {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>Save All Banners</span>
          </Button>
        </div>
      </div>

      {/* Main Slides List */}
      {isLoading ? (
        <div className="h-64 rounded-2xl border border-border/80 bg-card p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground shadow-2xs">
          <RefreshCw className="size-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold">Loading Hero Sliders...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`bg-card border rounded-2xl p-5 shadow-2xs transition-all space-y-5 ${
                slide.isActive !== false
                  ? "border-border/80"
                  : "border-rose-500/30 bg-muted/20 opacity-75"
              }`}
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 font-extrabold text-xs">
                    #{index + 1}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground truncate max-w-xs sm:max-w-md">
                    {slide.title || "Untitled Slide"}
                  </h3>
                  {slide.isActive !== false ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-rose-500 border-rose-500/30 text-[10px] font-bold">
                      Hidden
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {/* Reorder Up */}
                  <button
                    onClick={() => moveSlide(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    onClick={() => moveSlide(index, "down")}
                    disabled={index === slides.length - 1}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>

                  {/* Toggle Active */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateSlide(index, "isActive", slide.isActive === false ? true : false)}
                    className="rounded-lg text-xs font-semibold h-8 px-2.5"
                  >
                    {slide.isActive === false ? "Show Slide" : "Hide Slide"}
                  </Button>

                  {/* Live Preview Button */}
                  <button
                    onClick={() => setPreviewSlide(slide)}
                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition cursor-pointer"
                    title="Preview Banner"
                  >
                    <Eye className="size-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteSlide(index)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left Column: Image & Image Selector */}
                <div className="md:col-span-4 space-y-3">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-amber-500" />
                    <span>Background Image URL</span>
                  </label>

                  <Input
                    value={slide.image}
                    onChange={(e) => updateSlide(index, "image", e.target.value)}
                    placeholder="https://..."
                    className="rounded-xl text-xs bg-background border-border h-9"
                  />

                  {/* Image Live Preview */}
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border bg-slate-900 shadow-2xs group">
                    <img
                      src={slide.image || SAMPLE_IMAGES[0]}
                      alt="Banner Preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SAMPLE_IMAGES[0];
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                        Live Image Preview
                      </span>
                    </div>
                  </div>

                  {/* Sample Preset Selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground block">
                      Quick Sample Background Presets:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SAMPLE_IMAGES.map((img, sampleIdx) => (
                        <button
                          key={sampleIdx}
                          type="button"
                          onClick={() => updateSlide(index, "image", img)}
                          className={`aspect-video rounded-lg overflow-hidden border cursor-pointer hover:scale-105 transition ${
                            slide.image === img ? "border-emerald-500 ring-2 ring-emerald-500/40" : "border-border"
                          }`}
                        >
                          <img src={img} alt="Sample" className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Text & Content Inputs */}
                <div className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Badge Pill */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Leaf className="size-3.5 text-emerald-500" />
                        <span>Badge Pill Text</span>
                      </label>
                      <Input
                        value={slide.badge}
                        onChange={(e) => updateSlide(index, "badge", e.target.value)}
                        placeholder="e.g. শ্রীমঙ্গলের ১০০% খাঁটি চা পাতা"
                        className="rounded-xl text-xs bg-background border-border h-9 font-medium"
                      />
                    </div>

                    {/* Tagline Footer */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-emerald-500" />
                        <span>Footer Tagline</span>
                      </label>
                      <Input
                        value={slide.tagline || ""}
                        onChange={(e) => updateSlide(index, "tagline", e.target.value)}
                        placeholder="e.g. ২৪-৪৮ ঘণ্টার মধ্যে সারা দেশে হোম ডেলিভারি"
                        className="rounded-xl text-xs bg-background border-border h-9 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Main Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">
                        Main Title (First Line)
                      </label>
                      <Input
                        value={slide.title}
                        onChange={(e) => updateSlide(index, "title", e.target.value)}
                        placeholder="e.g. প্রতি চুমুতেই অনুভব করুন"
                        className="rounded-xl text-xs bg-background border-border h-9 font-extrabold"
                      />
                    </div>

                    {/* Highlighted Gradient Text */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Highlighted Text (Gradient Color)
                      </label>
                      <Input
                        value={slide.highlightText || ""}
                        onChange={(e) => updateSlide(index, "highlightText", e.target.value)}
                        placeholder="e.g. খাঁটি চায়ের আসল আভিজাত্য"
                        className="rounded-xl text-xs bg-background border-emerald-500/40 text-emerald-600 dark:text-emerald-400 h-9 font-extrabold"
                      />
                    </div>
                  </div>

                  {/* Description Textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      Description Subtitle
                    </label>
                    <Textarea
                      rows={2}
                      value={slide.description}
                      onChange={(e) => updateSlide(index, "description", e.target.value)}
                      placeholder="e.g. শ্রীমঙ্গলের ঐতিহ্যবাহী চা বাগান থেকে বাছাইকৃত তাজা দুটি পাতা..."
                      className="rounded-xl text-xs bg-background border-border resize-none font-normal"
                    />
                  </div>

                  {/* Button Link Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Primary Button */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/80">
                      <span className="text-[11px] font-bold text-foreground block">
                        Primary Button (Main CTA)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={slide.primaryBtnText}
                          onChange={(e) => updateSlide(index, "primaryBtnText", e.target.value)}
                          placeholder="Button Label"
                          className="rounded-lg text-[11px] h-8 bg-background"
                        />
                        <Input
                          value={slide.primaryBtnLink}
                          onChange={(e) => updateSlide(index, "primaryBtnLink", e.target.value)}
                          placeholder="Link (/shop)"
                          className="rounded-lg text-[11px] h-8 bg-background font-mono"
                        />
                      </div>
                    </div>

                    {/* Secondary Button */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/80">
                      <span className="text-[11px] font-bold text-foreground block">
                        Secondary Button (Optional)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={slide.secondaryBtnText || ""}
                          onChange={(e) => updateSlide(index, "secondaryBtnText", e.target.value)}
                          placeholder="Button Label"
                          className="rounded-lg text-[11px] h-8 bg-background"
                        />
                        <Input
                          value={slide.secondaryBtnLink || ""}
                          onChange={(e) => updateSlide(index, "secondaryBtnLink", e.target.value)}
                          placeholder="Link (/deals)"
                          className="rounded-lg text-[11px] h-8 bg-background font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Save Toolbar */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          size="lg"
          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-2xl gap-2 px-6 py-6 cursor-pointer border border-emerald-400/40"
        >
          {isSaving ? <RefreshCw className="size-5 animate-spin" /> : <Save className="size-5" />}
          <span>Save All Sliders</span>
        </Button>
      </div>

      {/* Live Preview Modal */}
      {previewSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 w-full max-w-4xl rounded-3xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                <span>Live Hero Banner Preview</span>
              </h3>
              <button
                onClick={() => setPreviewSlide(null)}
                className="size-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Slide Preview Container */}
            <div className="relative aspect-[21/9] min-h-[300px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-border">
              <img
                src={previewSlide.image || SAMPLE_IMAGES[0]}
                alt="Preview"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
              <div className="absolute inset-0 flex items-center p-6 sm:p-10">
                <div className="max-w-lg space-y-3 text-white">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs font-bold text-emerald-300">
                    <Leaf className="size-3 text-emerald-400" />
                    <span>{previewSlide.badge}</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
                    {previewSlide.title}{" "}
                    {previewSlide.highlightText && (
                      <span className="block text-emerald-400">{previewSlide.highlightText}</span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-200 line-clamp-2">{previewSlide.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                      {previewSlide.primaryBtnText}
                    </span>
                    {previewSlide.secondaryBtnText && (
                      <span className="px-4 py-2 rounded-xl border border-white/40 bg-white/10 text-white text-xs font-bold">
                        {previewSlide.secondaryBtnText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
