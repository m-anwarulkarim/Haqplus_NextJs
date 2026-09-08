import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSort } from "@/components/products/product-sort";
import { ShoppingBag, Leaf } from "lucide-react";
import { TEA_PRODUCTS, TEA_CATEGORIES } from "@/lib/data/tea-products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "সকল প্রিমিয়াম চা পাতা — haqplus Tea Catalog",
  description: "শ্রীমঙ্গল ও সিলেটের তাজা ব্ল্যাক টি, গ্রিন টি, মসলা চা ও ভেষজ চা। সেরা দামে অনলাইনে অর্ডার করুন।",
};

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsCatalogPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = params.sort || "featured";

  // Build filter query
  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = {
      OR: [{ slug: category }, { id: category }],
    };
  }

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

  let categories: any[] = [];
  let rawProducts: any[] = [];

  try {
    const [fetchedCategories, fetchedProducts] = await Promise.all([
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
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
    if (fetchedProducts && fetchedProducts.length > 0) {
      categories = fetchedCategories;
      rawProducts = fetchedProducts;
    }
  } catch (err) {
    console.warn("Products DB lookup fallback to tea catalog:", err);
  }

  let formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    itemCount: c._count.products,
  }));

  // Fallback to TEA_CATEGORIES if DB categories are empty
  if (formattedCategories.length === 0) {
    formattedCategories = TEA_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.bengaliName,
      slug: c.slug,
      itemCount: 4,
    }));
  }

  let products = rawProducts.map((p) => {
    const avgRating =
      p.reviews && p.reviews.length > 0
        ? Number(
            (
              p.reviews.reduce(
                (acc: number, r: { rating: number }) => acc + r.rating,
                0
              ) / p.reviews.length
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

  // Fallback to TEA_PRODUCTS if DB has no products
  if (products.length === 0) {
    let fallbackTeas = [...TEA_PRODUCTS];
    if (category) {
      fallbackTeas = fallbackTeas.filter(
        (t) => t.category === category || t.categorySlug === category
      );
    }
    if (search) {
      const q = search.toLowerCase();
      fallbackTeas = fallbackTeas.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.bengaliName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    if (minPrice !== undefined) {
      fallbackTeas = fallbackTeas.filter((t) => t.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      fallbackTeas = fallbackTeas.filter((t) => t.price <= maxPrice);
    }
    if (sort === "price-asc") {
      fallbackTeas.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      fallbackTeas.sort((a, b) => b.price - a.price);
    }

    products = fallbackTeas.map((t) => ({
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Leaf className="size-6 text-emerald-600" />
            <span>
              {category
                ? `${formattedCategories.find((c) => c.slug === category)?.name || "চা"} কালেকশন`
                : "সকল প্রিমিয়াম চা কালেকশন"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            মোট {products.length}টি চা পাওয়া গেছে {search && `"${search}" এর জন্য`}
          </p>
        </div>

        <ProductSort />
      </div>

      {/* Main Catalog View: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilters categories={formattedCategories} />
        </aside>

        {/* Right Products Grid */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-3xl border border-dashed border-border/80 p-8">
              <div className="size-16 rounded-full bg-muted/60 flex items-center justify-center mb-4 text-muted-foreground">
                <ShoppingBag className="size-8" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                কোনো চা পাওয়া যায়নি
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                অনুগ্রহ করে আপনার সার্চ অথবা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>  
          )}
        </div>
      </div>
    </div>
  );
}
