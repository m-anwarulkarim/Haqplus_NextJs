"use client";

import { useMemo } from "react";
import type { ProductVariant } from "@/types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  const sizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.size) set.add(v.size);
    });
    return Array.from(set);
  }, [variants]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.color) set.add(v.color);
    });
    return Array.from(set);
  }, [variants]);

  if (variants.length === 0) return null;

  return (
    <div className="space-y-4 py-2">
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Select Size:</span>
            {selectedVariant?.size && (
              <span className="font-mono text-muted-foreground uppercase">
                {selectedVariant.size}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => {
              const isSelected = selectedVariant?.size === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    const match = variants.find(
                      (v) =>
                        v.size === sz &&
                        (!selectedVariant?.color || v.color === selectedVariant.color)
                    );
                    if (match) onSelectVariant(match);
                  }}
                  className={`h-10 min-w-12 rounded-xl px-3 text-xs font-semibold uppercase transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                      : "border border-border/80 bg-background text-foreground hover:border-primary/50 hover:bg-muted/40"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Select Color:</span>
            {selectedVariant?.color && (
              <span className="font-medium text-muted-foreground capitalize">
                {selectedVariant.color}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((col) => {
              const isSelected = selectedVariant?.color === col;
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => {
                    const match = variants.find(
                      (v) =>
                        v.color === col &&
                        (!selectedVariant?.size || v.size === selectedVariant.size)
                    );
                    if (match) onSelectVariant(match);
                  }}
                  className={`h-9 rounded-xl border px-3.5 text-xs font-medium capitalize transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold"
                      : "border-border/80 bg-background text-foreground hover:bg-muted/40"
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant SKU & Stock Feedback */}
      {selectedVariant && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            SKU: <strong className="font-mono text-foreground">{selectedVariant.sku}</strong>
          </span>
          <span>
            {selectedVariant.stock > 0 ? (
              <span className="text-emerald-600 font-semibold">
                In Stock ({selectedVariant.stock} units available)
              </span>
            ) : (
              <span className="text-destructive font-semibold">Out of Stock</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
