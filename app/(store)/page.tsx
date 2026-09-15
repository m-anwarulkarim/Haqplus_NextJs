import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Leaf,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/store/hero-slider";
import { ProductCard } from "@/components/store/product-card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {
  let categories: any[] = [];
  let products: any[] = [];

  try {
    // Fetch categories from database
    const dbCategories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      take: 5,
    });

    categories = dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image || "/placeholder.png",
      itemCount: c._count.products,
    }));

    // Fetch featured/active products from database
    const dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    products = dbProducts.map((p) => {
      const basePriceNum = Number(p.basePrice);
      const discountPriceNum = p.discountPrice ? Number(p.discountPrice) : null;
      const avgRating =
        p.reviews && p.reviews.length > 0
          ? Number(
              (
                p.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) /
                p.reviews.length
              ).toFixed(1)
            )
          : 5.0;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        images: p.images,
        price: discountPriceNum ?? basePriceNum,
        originalPrice: discountPriceNum ? basePriceNum : undefined,
        category: p.category.name,
        categorySlug: p.category.slug,
        rating: avgRating,
        reviewCount: p.reviews?.length || 0,
        inStock: p.stock > 0,
        isFeatured: p.isFeatured,
      };
    });
  } catch (dbErr) {
    console.warn("Storefront DB fetch fallback:", dbErr);
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Image Slider Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <HeroSlider />
      </section>

      {/* Featured Tea Categories Grid */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <Sparkles className="size-3.5" />
              <span>চায়ের ক্যাটাগরি</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              আপনার পছন্দের চা বেছে নিন
            </h2>
          </div>
          <Button variant="ghost" asChild className="group text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            <Link href="/shop">
              <span>সবগুলো ক্যাটাগরি দেখুন</span>
              <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Category Row: 1 line on PC (5 items) and 1 line on Mobile (3 visible items) */}
        <div className="flex overflow-x-auto no-scrollbar gap-2.5 sm:gap-4 pb-2 lg:grid lg:grid-cols-5 snap-x snap-mandatory">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center text-center rounded-2xl border border-border/80 bg-card p-2 sm:p-3 shadow-2xs hover:shadow-md hover:border-emerald-600/50 hover:-translate-y-1 transition-all duration-300 w-[calc((100%-20px)/3)] min-w-[95px] lg:w-auto shrink-0 snap-start cursor-pointer"
            >
              {/* Category Image */}
              <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted/40 mb-2">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Title & Item Count */}
              <div className="w-full">
                <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors line-clamp-1 leading-snug">
                  {category.name}
                </h3>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 block mt-0.5 font-medium">
                  {category.itemCount}টি পণ্য
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Tea Products Grid */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <Leaf className="size-3.5" />
              <span>জনপ্রিয় কালেকশন</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Best Selling Products
            </h2>
          </div>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/shop">সবগুলো চা দেখুন ({products.length}টি)</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>  
      </section>

      {/* Trust & Quality Banner */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-emerald-900/10 via-emerald-800/5 to-teal-900/10 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-teal-950/30 p-8 lg:p-12 backdrop-blur-xl shadow-2xl">
          {/* Decorative Glow Elements */}
          <div className="absolute -top-24 -right-24 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-teal-500/10 blur-3xl" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="group flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 shrink-0 border border-emerald-600/20 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                <Truck className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-foreground tracking-tight">দ্রুততম হোম ডেলিভারি</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Steadfast কুরিয়ার সার্ভিসের মাধ্যমে ঢাকা ও সমগ্র বাংলাদেশে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে পৌঁছে দেওয়া হয়।
                </p>
              </div>
            </div>

            <div className="group flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 shrink-0 border border-emerald-600/20 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                <ShieldCheck className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-foreground tracking-tight">শতভাগ খাঁটি চায়ের গ্যারান্টি</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  কোনো ক্ষতিকর রাসায়নিক বা ভেজাল ছাড়া সরাসরি বাগান থেকে রি-প্যাক করা খাঁটি চা পাতা।
                </p>
              </div>
            </div>

            <div className="group flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 shrink-0 border border-emerald-600/20 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                <RotateCcw className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-foreground tracking-tight">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  আগে কোনো অগ্রিম টাকা লাগবে না, ডেলিভারি ম্যানের কাছ থেকে প্যাকেট বুঝে নিয়ে টাকা পরিশোধ করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
