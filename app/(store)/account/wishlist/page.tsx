"use client";

import Link from "next/link";
import { Heart, ArrowLeft, ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { TEA_PRODUCTS } from "@/lib/data/tea-products";

export default function WishlistPage() {
  const { addItem } = useCartStore();
  
  // Sample wishlist items from tea products list
  const wishlistProducts = TEA_PRODUCTS.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/account">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Heart className="size-6 text-rose-500 fill-rose-500" /> পছন্দের তালিকা (Saved Wishlist)
          </h1>
          <p className="text-sm text-muted-foreground">আপনার সংরক্ষিত প্রিয় সব অর্গানিক চা পাতা</p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Heart className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">উইশলিস্ট খালি</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            পছন্দের তালিকায় এখনো কোনো চা যোগ করা হয়নি। শপে ঘুরে আপনার পছন্দের চা সেভ করুন!
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/shop">চা ব্রাউজ করুন</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-border/80 group hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="aspect-square relative bg-muted overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {product.weight}
                  </span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-emerald-600 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ৳{product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                    })
                  }
                >
                  <ShoppingCart className="size-3.5" /> কার্টে যোগ করুন
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
