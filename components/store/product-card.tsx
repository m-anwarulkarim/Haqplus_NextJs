"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/types";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isSelected, setIsSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Discount % হিসাব
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Link এর ভেতরে বাটন থাকায় navigation আটকানো হচ্ছে
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.png",
      category: product.category,
    });
    setIsSelected(true);
    toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuantity(prev => prev + 1);
    // Ideally we would update cart item quantity here
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      // Ideally we would update cart item quantity here
    } else {
      setIsSelected(false);
    }
  };

  return (
    <Card className={`group relative flex flex-col overflow-hidden rounded-[20px] bg-card text-card-foreground dark:bg-slate-900/90 dark:border-slate-800 transition-all duration-300 hover:shadow-xl sm:rounded-[24px] ${isSelected ? 'border-2 border-emerald-600 shadow-md' : 'border border-border/60 hover:border-emerald-600/50'}`}>
      
      {/* Selected Badge (Top Left inside image) */}
      {isSelected && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-md sm:text-[11px]">
          <Check className="size-3" />
          <span>নির্বাচিত</span>
        </div>
      )}

      {/* Discount Badge */}
      {!isSelected && discount > 0 && (
        <Badge className="absolute top-3 left-3 z-20 rounded-full border-0 bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm sm:text-[11px]">
          -{discount}%
        </Badge>
      )}

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toast.success(`${product.name} উইশলিস্টে সেভ হয়েছে!`);
        }}
        className="absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground dark:bg-slate-800/90 dark:text-slate-200 opacity-100 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-500 sm:size-9 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
        aria-label="Add to wishlist"
      >
        <Heart className="size-4 sm:size-4.5" />
      </button>

      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40 dark:bg-slate-800/60">
        <Link
          href={`/products/${product.slug}`}
          className="relative block size-full cursor-pointer"
        >
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-black/30" />
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <CardContent className="flex flex-1 flex-col items-center p-0 text-center">
          
          <Link href={`/products/${product.slug}`} className="cursor-pointer w-full">
            <h3 className="mb-1.5 sm:mb-2 line-clamp-1 text-[14px] sm:text-[17px] font-extrabold text-foreground dark:text-emerald-300 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {product.name}
            </h3>
          </Link>

          <p className="mb-3 sm:mb-4 text-[11px] sm:text-[12px] leading-relaxed text-muted-foreground line-clamp-2 px-1 font-medium">
            {product.description}
          </p>

          <div className="mt-auto flex flex-col items-center justify-center gap-1">
            <div className="flex items-center justify-center gap-2">
              {product.originalPrice && (
                <span className="font-mono text-[11px] sm:text-[13px] text-muted-foreground/70 line-through">
                  ৳{product.originalPrice.toFixed(0)}
                </span>
              )}
              <span className="font-mono text-[17px] sm:text-[22px] font-black text-emerald-600 dark:text-emerald-400">
                ৳{product.price.toFixed(0)}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
              <span className="text-emerald-500/60">•</span>
              <span>{product.category || "১ প্যাক"}</span>
            </div>
          </div>
        </CardContent>

        {/* Action Area */}
        <CardFooter className="mt-4 sm:mt-5 flex flex-col p-0">
          {!isSelected ? (
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full h-9 sm:h-11 rounded-[12px] sm:rounded-[14px] border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-200 transition-all gap-1.5 sm:gap-2 bg-background dark:bg-slate-800/90 dark:border-slate-700"
            >
              <ShoppingBag className="size-3.5 sm:size-4" />
              <span className="text-[12px] sm:text-[14px] font-bold tracking-wide">নির্বাচন করুন</span>
            </Button>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button
                className="w-full h-9 sm:h-11 rounded-[12px] sm:rounded-[14px] bg-emerald-600 text-white hover:bg-emerald-700 transition-all gap-2 cursor-default pointer-events-none"
              >
                <Check className="size-4" />
                <span className="text-[12px] sm:text-[14px] font-bold tracking-wide">নির্বাচিত</span>
              </Button>
              
              <div className="flex items-center justify-between rounded-[12px] sm:rounded-[14px] border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDecrement}
                  className="size-7 sm:size-8 rounded-[10px] text-emerald-700 dark:text-emerald-300 hover:bg-background hover:text-emerald-800 dark:hover:text-white hover:shadow-sm transition-all"
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="font-mono text-[13px] sm:text-[14px] font-bold text-emerald-800 dark:text-emerald-200 w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleIncrement}
                  className="size-7 sm:size-8 rounded-[10px] text-emerald-700 dark:text-emerald-300 hover:bg-background hover:text-emerald-800 dark:hover:text-white hover:shadow-sm transition-all"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}