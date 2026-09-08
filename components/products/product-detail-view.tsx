"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "./product-gallery";
import { VariantSelector } from "./variant-selector";
import { ReviewSection } from "./review-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCartStore } from "@/lib/store/cart-store";
import { trackEvent } from "@/lib/tracking";
import { toast } from "@/components/ui/toast";
import type { Product, ProductVariant } from "@/types";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  // Active price depends on selected variant or product discount
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice = product.originalPrice;
  const isAvailable = selectedVariant ? selectedVariant.stock > 0 : product.inStock;

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: activePrice,
        image: product.images[0] || "/placeholder.png",
        category: product.category,
        size: selectedVariant?.size || undefined,
        color: selectedVariant?.color || undefined,
        sku: selectedVariant?.sku || product.sku,
      },
      quantity
    );

    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      content_category: product.category,
      value: activePrice * quantity,
      num_items: quantity,
    });

    toast.success(`Added ${quantity}x ${product.name} to your cart!`);
  };

  const handleBuyNow = () => {
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: activePrice,
        image: product.images[0] || "/placeholder.png",
        category: product.category,
        size: selectedVariant?.size || undefined,
        color: selectedVariant?.color || undefined,
        sku: selectedVariant?.sku || product.sku,
      },
      quantity
    );

    trackEvent("InitiateCheckout", {
      content_name: product.name,
      content_ids: [product.id],
      value: activePrice * quantity,
      num_items: quantity,
    });

    router.push("/checkout");
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 sticky top-24">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & Badge */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              {product.category || "Collection"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full border border-border/80 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full border border-border/80 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Share"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Title & Ratings */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="size-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-foreground text-sm">{product.rating}</span>
              </div>
              <span>•</span>
              <span className="font-medium underline underline-offset-4 cursor-pointer">
                {product.reviewCount} customer {product.reviewCount === 1 ? "review" : "reviews"}
              </span>
              <span>•</span>
              <span className="font-mono text-muted-foreground">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 border-y border-border/60 py-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              ${activePrice.toFixed(2)}
            </span>
            {originalPrice && originalPrice > activePrice && (
              <>
                <span className="text-lg text-muted-foreground line-through font-mono">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-600">
                  Save ${(originalPrice - activePrice).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl bg-background shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                size="lg"
                disabled={!isAvailable}
                onClick={handleAddToCart}
                className="h-12 rounded-2xl text-sm font-semibold gap-2 shadow-sm"
              >
                <ShoppingBag className="size-4" />
                <span>Add to Cart</span>
              </Button>

              <Button
                type="button"
                size="lg"
                variant="outline"
                disabled={!isAvailable}
                onClick={handleBuyNow}
                className="h-12 rounded-2xl text-sm font-semibold gap-2 border-primary/40 hover:bg-primary hover:text-primary-foreground"
              >
                <Zap className="size-4" />
                <span>Buy Now</span>
              </Button>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 text-center">
            <div className="flex flex-col items-center gap-1 text-xs">
              <Truck className="size-4 text-primary" />
              <span className="font-semibold text-foreground">Free Delivery</span>
              <span className="text-[10px] text-muted-foreground">Orders over $75</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-xs border-x border-border/60">
              <ShieldCheck className="size-4 text-primary" />
              <span className="font-semibold text-foreground">100% Genuine</span>
              <span className="text-[10px] text-muted-foreground">Warranty backed</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-xs">
              <RotateCcw className="size-4 text-primary" />
              <span className="font-semibold text-foreground">30-Day Return</span>
              <span className="text-[10px] text-muted-foreground">Easy refunds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specs, Shipping */}
      <div className="pt-8 border-t border-border/80">
        <Tabs defaultValue="description">
          <TabsList className="h-11 p-1 bg-muted/60 rounded-2xl">
            <TabsTrigger value="description" className="rounded-xl px-5 text-xs font-semibold">
              Description & Details
            </TabsTrigger>
            <TabsTrigger value="specs" className="rounded-xl px-5 text-xs font-semibold">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-xl px-5 text-xs font-semibold">
              Shipping & Courier
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>{product.description}</p>
            <p>
              Engineered with meticulous attention to detail, this product undergoes
              thorough quality inspections to guarantee exceptional longevity, ergonomic comfort,
              and premier functionality for discerning users.
            </p>
          </TabsContent>

          <TabsContent value="specs" className="pt-6">
            <div className="max-w-xl divide-y divide-border/60 rounded-2xl border border-border/80 bg-card p-4 text-xs">
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Brand / Merchant</span>
                <span className="font-semibold text-emerald-600">haqplus Official</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Main SKU</span>
                <span className="font-mono text-foreground">{product.sku}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground capitalize">{product.category}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Inventory Status</span>
                <span className="text-emerald-600 font-semibold">{product.stock} units available</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="pt-6 space-y-3 text-xs text-muted-foreground leading-relaxed max-w-2xl">
            <p className="font-semibold text-foreground text-sm">Domestic Delivery via Steadfast Courier:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Inside Dhaka: 24 to 48 hours delivery time. Standard rate BDT 60.</li>
              <li>Outside Dhaka: 48 to 72 hours express nationwide coverage via Steadfast Courier.</li>
              <li>Cash on Delivery (COD) supported across all 64 districts in Bangladesh.</li>
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-8 border-t border-border/80">
        <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">
          Customer Reviews & Feedback
        </h3>
        <ReviewSection
          productId={product.id}
          reviews={product.reviews || []}
          rating={product.rating ?? 5.0}
          reviewCount={product.reviewCount ?? 0}
        />
      </div>
    </div>
  );
}
