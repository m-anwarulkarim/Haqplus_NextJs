import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSort } from "@/components/products/product-sort";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Leaf } from "lucide-react";
import { TEA_PRODUCTS, TEA_CATEGORIES } from "@/lib/data/tea-products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let category: any = null;

  try {
    category = await prisma.category.findUnique({
      where: { slug },
    });
  } catch (e) {
    // DB offline
  }

  if (!category) {
    category = TEA_CATEGORIES.find((c) => c.slug === slug);
  }

  if (!category) return { title: "ক্যাটাগরি পাওয়া যায়নি — haqplus" };

  return {
    title: `${category.bengaliName || category.name} — haqplus`,
    description: `haqplus থেকে কিনুন প্রিমিয়াম ${category.bengaliName || category.name}। ১০০% খাঁটি বাগান ফ্রেশ চা পাতা।`,
  };
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  let dbCategory: any = null;
  let allCategoriesRaw: any[] = [];
  let dbProducts: any[] = [];

  try {
    dbCategory = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
      },
    });

    if (dbCategory) {
      const minPrice = sParams.minPrice ? Number(sParams.minPrice) : undefined;
      const maxPrice = sParams.maxPrice ? Number(sParams.maxPrice) : undefined;
      const sort = sParams.sort || "featured";

      const where: any = {
        isActive: true,
        category: {
          OR: [{ id: dbCategory.id }, { slug: dbCategory.slug }, { parentId: dbCategory.id }],
        },
      };

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.basePrice = {};
        if (minPrice !== undefined) where.basePrice.gte = minPrice;
        if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
      }

      let orderBy: any = { createdAt: "desc" };
      if (sort === "price-asc") orderBy = { basePrice: "asc" };
      if (sort === "price-desc") orderBy = { basePrice: "desc" };
      if (sort === "newest") orderBy = { createdAt: "desc" };
      if (sort === "featured") orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];

      const [cats, prods] = await Promise.all([
        prisma.category.findMany({
          include: { _count: { select: { products: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.product.findMany({
          where,
          include: {
            category: { select: { name: true, slug: true } },
            reviews: { select: { rating: true } },
          },
          orderBy,
        }),
      ]);

      allCategoriesRaw = cats;
      dbProducts = prods;
    }
  } catch (err) {
    console.warn("Category DB lookup fallback:", err);
  }

  let currentCategory: any = dbCategory;
  if (!currentCategory) {
    currentCategory = TEA_CATEGORIES.find((c) => c.slug === slug);
  }

  if (!currentCategory) {
    notFound();
  }

  const categoryName = currentCategory.bengaliName || currentCategory.name;

  let formattedCategories = allCategoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    itemCount: c._count.products,
  }));

  if (formattedCategories.length === 0) {
    formattedCategories = TEA_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.bengaliName,
      slug: c.slug,
      itemCount: 4,
    }));
  }

  let formattedProducts = dbProducts.map((p) => {
    const avgRating =
      p.reviews && p.reviews.length > 0
        ? Number(
            (
              p.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) /
              p.reviews.length
            ).toFixed(1)
          )
        : 5.0;

    const basePriceNum = Number(p.basePrice);
    const discountPriceNum = p.discountPrice ? Number(p.discountPrice) : null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      images: p.images,
      price: discountPriceNum ?? basePriceNum,
      originalPrice: discountPriceNum ? basePriceNum : undefined,
      category: p.category.name,
      rating: avgRating,
      reviewCount: p.reviews?.length || 0,
      inStock: p.stock > 0,
      isFeatured: p.isFeatured,
    };
  });

  // Fallback to TEA_PRODUCTS filtered by category
  if (formattedProducts.length === 0) {
    const matchingTeas = TEA_PRODUCTS.filter(
      (t) => t.category === slug || t.categorySlug === slug
    );

    formattedProducts = matchingTeas.map((t) => ({
      id: t.id,
      name: t.bengaliName || t.name,
      slug: t.slug,
      description: t.description,
      images: t.images,
      price: t.price,
      originalPrice: t.originalPrice,
      category: t.categoryName,
      rating: t.rating,
      reviewCount: t.reviewCount,
      inStock: t.inStock,
      isFeatured: t.isFeatured,
    }));
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          হোম (Home)
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-emerald-600 transition-colors">
          সকল চা (Products)
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-foreground">{categoryName}</span>
      </nav>

      {/* Category Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-2.5">
            <Leaf className="size-7 text-emerald-600" />
            <span>{categoryName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {currentCategory.description || `haqplus থেকে কিনুন প্রিমিয়াম ${categoryName} কালেকশন।`}
          </p>
        </div>

        <ProductSort />
      </div>

      {/* Main Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters categories={formattedCategories} />
        </aside>

        <div className="lg:col-span-3">
          {formattedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-3xl border border-dashed border-border/80 p-8">
              <div className="size-16 rounded-full bg-muted/60 flex items-center justify-center mb-4 text-muted-foreground">
                <ShoppingBag className="size-8" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                এই ক্যাটাগরিতে কোনো চা পাওয়া যায়নি
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                শীঘ্রই নতুন ফ্রেশ চা পাতা যুক্ত করা হবে। অনুগ্রহ করে অন্যান্য ক্যাটাগরিগুলো দেখুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {formattedProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>  
          )}
        </div>
      </div>
    </div>
  );
}
