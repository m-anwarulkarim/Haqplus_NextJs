"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

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
    toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
  };

  return (
    // shadcn Card — default padding override করে edge-to-edge image রাখা হলো
    <Card className="group relative gap-0 overflow-hidden rounded-xl border-border/70 py-0 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-lg sm:rounded-2xl">
      {/* Product Image Link */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        <Link
          href={`/products/${product.slug}`}
          className="relative block size-full cursor-pointer"
        >
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Discount Badge — shadcn Badge ব্যবহার করা হলো */}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 rounded-full border-0 bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-600 sm:text-[11px]">
              -{discount}%
            </Badge>
          )}
        </Link>

        {/* Wishlist button — mobile-এ সবসময় visible (touch এ hover কাজ করে না) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.success(`${product.name} উইশলিস্টে সেভ হয়েছে!`);
          }}
          className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground opacity-100 shadow-md transition-all hover:bg-emerald-600 hover:text-white sm:size-8 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
          aria-label="Add to wishlist"
        >
          <Heart className="size-3.5 sm:size-4" />
        </button>
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-1 p-2.5 sm:p-4">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground sm:text-xs">
          <span className="truncate font-medium capitalize">{product.category}</span>
          <div className="flex shrink-0 items-center gap-1 text-amber-500">
            <Star className="size-3 fill-amber-500 text-amber-500 sm:size-3.5" />
            <span className="font-bold text-foreground">{product.rating}</span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`} className="cursor-pointer">
          <h3 className="line-clamp-1 text-[13px] leading-snug font-semibold text-foreground transition-colors group-hover:text-emerald-600 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Description — মোবাইলে hide, জায়গা বাঁচাতে */}
        <p className="hidden text-xs text-muted-foreground line-clamp-1 sm:block">
          {product.description}
        </p>
      </CardContent>

      {/* Price + Add to cart */}
      <CardFooter className="flex items-center justify-between gap-2 p-2.5 pt-0 sm:p-4 sm:pt-0">
        <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
          <span className="truncate font-mono text-sm font-extrabold text-foreground sm:text-base">
            ৳{product.price.toFixed(0)}
          </span>
          {product.originalPrice && (
            <span className="font-mono text-[10px] text-muted-foreground line-through sm:text-xs">
              ৳{product.originalPrice.toFixed(0)}
            </span>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleAddToCart}
          className="h-7 shrink-0 gap-1 rounded-lg bg-emerald-600 px-2.5 hover:bg-emerald-700 sm:h-8 sm:gap-1.5 sm:rounded-xl sm:px-3"
        >
          <ShoppingBag className="size-3 sm:size-3.5" />
          <span className="text-[11px] font-semibold sm:text-xs">যোগ করুন</span>
        </Button>
      </CardFooter>
    </Card>
  );
}