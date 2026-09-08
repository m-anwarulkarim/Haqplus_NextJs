"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const MIN_LIMIT = 0;
  const MAX_LIMIT = 1000;

  const [sliderMax, setSliderMax] = useState<number>(
    currentMaxPrice ? Number(currentMaxPrice) : MAX_LIMIT
  );

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset pagination
    router.push(`${pathname}?${params.toString()}`);
  };

  const applySliderFilter = (maxVal: number, minVal?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (maxVal < MAX_LIMIT) {
      params.set("maxPrice", maxVal.toString());
    } else {
      params.delete("maxPrice");
    }

    if (minVal && minVal > 0) {
      params.set("minPrice", minVal.toString());
    } else {
      params.delete("minPrice");
    }

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setSliderMax(MAX_LIMIT);
    router.push(pathname);
  };

  const progressPercentage = Math.min(
    100,
    Math.max(0, ((sliderMax - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100)
  );

  const hasActiveFilters = Boolean(currentCategory || currentMinPrice || currentMaxPrice);

  return (
    <div className="space-y-6 rounded-3xl border border-border/80 bg-card p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground">ফিল্টার অপশন</h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>রিসেট</span>
          </button>
        )}
      </div>

      {/* Category Tree */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          ক্যাটাগরি
        </h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParam("category", null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
              !currentCategory
                ? "bg-emerald-600 text-white font-bold"
                : "text-foreground hover:bg-muted/70"
            }`}
          >
            <span>সকল চা (All)</span>
            {!currentCategory && <Check className="size-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug || currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParam("category", cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-foreground hover:bg-muted/70"
                }`}
              >
                <span>{cat.name}</span>
                {isSelected ? (
                  <Check className="size-3.5" />
                ) : (
                  cat.itemCount !== undefined && (
                    <span className="text-[11px] text-muted-foreground">
                      {cat.itemCount}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter with Interactive Progress Bar & Slider */}
      <div className="space-y-4 border-t border-border/60 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            মূল্যের পরিসীমা (Price Range)
          </h4>
          <span className="font-mono font-bold text-xs text-emerald-600">
            ৳{minPrice || 0} — ৳{sliderMax}
          </span>
        </div>

        {/* Visual Progress Bar & Slider Control */}
        <div className="space-y-2">
          <div className="relative py-1 flex items-center">
            {/* Visual Background Track */}
            <div className="absolute left-0 right-0 h-2.5 rounded-full bg-muted overflow-hidden">
              {/* Dynamic Filled Progress Bar */}
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Overlaid Interactive Range Slider */}
            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step={20}
              value={sliderMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSliderMax(val);
                setMaxPrice(val.toString());
              }}
              onPointerUp={() => applySliderFilter(sliderMax, minPrice ? Number(minPrice) : undefined)}
              className="relative z-10 w-full h-4 appearance-none bg-transparent cursor-pointer accent-emerald-600 focus:outline-none"
            />
          </div>

          {/* Scale Markers */}
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>৳০</span>
            <span>৳৫০০</span>
            <span>৳১০০০</span>
          </div>
        </div>

        {/* Quick Price Preset Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setSliderMax(300);
              setMaxPrice("300");
              setMinPrice("");
              applySliderFilter(300, 0);
            }}
            className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              currentMaxPrice === "300"
                ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 font-bold"
                : "border-border/70 hover:bg-muted/40 text-muted-foreground"
            }`}
          >
            ৳৩০০ এর নিচে
          </button>
          <button
            type="button"
            onClick={() => {
              setSliderMax(450);
              setMaxPrice("450");
              setMinPrice("");
              applySliderFilter(450, 0);
            }}
            className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              currentMaxPrice === "450"
                ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 font-bold"
                : "border-border/70 hover:bg-muted/40 text-muted-foreground"
            }`}
          >
            ৳৪৫০ এর নিচে
          </button>
        </div>

        {/* Manual Min/Max Inputs & Apply */}
        <form onSubmit={handlePriceApply} className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground font-medium">সর্বনিম্ন (Min)</span>
              <Input
                type="number"
                min="0"
                placeholder="০"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-8 text-xs rounded-xl"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-medium">সর্বোচ্চ (Max)</span>
              <Input
                type="number"
                min="0"
                placeholder="১০০০"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  if (e.target.value) setSliderMax(Number(e.target.value));
                }}
                className="h-8 text-xs rounded-xl"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="sm"
            className="w-full text-xs rounded-xl h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            ফিল্টার প্রয়োগ করুন
          </Button>
        </form>
      </div>
    </div>
  );
}
