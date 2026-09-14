import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let product: any = null;

  try {
    product = await prisma.product.findUnique({
      where: { slug },
    });
  } catch (e) {
    // DB offline
  }

  if (!product) return { title: "চা পাওয়া যায়নি — haqplus" };

  return {
    title: `${product.bengaliName || product.name} — Buy Online at haqplus`,
    description: product.metaDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images?.length > 0 ? [{ url: product.images[0] }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images?.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dbProduct: any = null;
  let relatedProductsRaw: any[] = [];

  try {
    dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (dbProduct) {
      relatedProductsRaw = await prisma.product.findMany({
        where: {
          categoryId: dbProduct.categoryId,
          id: { not: dbProduct.id },
          isActive: true,
        },
        include: {
          category: { select: { name: true } },
          reviews: { select: { rating: true } },
        },
        take: 4,
      });
    }
  } catch (err) {
    console.warn("Product DB lookup fallback:", err);
  }

  let formattedProduct: any = null;

  if (dbProduct) {
    const basePriceNum = Number(dbProduct.basePrice);
    const discountPriceNum = dbProduct.discountPrice ? Number(dbProduct.discountPrice) : null;
    const avgRating =
      dbProduct.reviews.length > 0
        ? Number(
            (
              dbProduct.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) /
              dbProduct.reviews.length
            ).toFixed(1)
          )
        : 5.0;

    formattedProduct = {
      id: dbProduct.id,
      name: dbProduct.name,
      slug: dbProduct.slug,
      description: dbProduct.description,
      images: dbProduct.images,
      basePrice: basePriceNum,
      discountPrice: discountPriceNum,
      price: discountPriceNum ?? basePriceNum,
      originalPrice: discountPriceNum ? basePriceNum : undefined,
      sku: dbProduct.sku,
      stock: dbProduct.stock,
      categoryId: dbProduct.categoryId,
      category: dbProduct.category.name,
      categorySlug: dbProduct.category.slug,
      isFeatured: dbProduct.isFeatured,
      isActive: dbProduct.isActive,
      rating: avgRating,
      reviewCount: dbProduct.reviews.length,
      inStock: dbProduct.stock > 0,
      variants: dbProduct.variants.map((v: any) => ({
        id: v.id,
        productId: v.productId,
        size: v.size,
        color: v.color,
        price: Number(v.price),
        stock: v.stock,
        sku: v.sku,
      })),
      reviews: dbProduct.reviews.map((r: any) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        userName: r.user?.name || "Customer",
        userImage: r.user?.image || undefined,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    };
  } else {
    notFound();
  }

  const formattedRelated = relatedProductsRaw.map((p) => {
    const rRating =
      p.reviews && p.reviews.length > 0
        ? Number(
            (p.reviews.reduce((a: number, b: any) => a + b.rating, 0) / p.reviews.length).toFixed(1)
          )
        : 5.0;
    const bPrice = Number(p.basePrice);
    const dPrice = p.discountPrice ? Number(p.discountPrice) : null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      images: p.images,
      price: dPrice ?? bPrice,
      originalPrice: dPrice ? bPrice : undefined,
      category: p.category.name,
      rating: rRating,
      reviewCount: p.reviews?.length || 0,
      inStock: p.stock > 0,
    };
  });

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: formattedProduct.name,
    image: formattedProduct.images,
    description: formattedProduct.description,
    sku: formattedProduct.sku,
    offers: {
      "@type": "Offer",
      url: `https://haqplus.com/products/${formattedProduct.slug}`,
      priceCurrency: "BDT",
      price: formattedProduct.price,
      availability: formattedProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: formattedProduct.rating,
      reviewCount: Math.max(1, formattedProduct.reviewCount),
    },
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* JSON-LD Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          হোম (Home)
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/shop" className="hover:text-emerald-600 transition-colors">
          সকল চা (All Teas)
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/category/${formattedProduct.categorySlug || "tea"}`}
          className="hover:text-emerald-600 transition-colors"
        >
          {formattedProduct.category}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
          {formattedProduct.name}
        </span>
      </nav>

      {/* Product Detail Main View */}
      <ProductDetailView product={formattedProduct as any} />

      {/* Related Products Grid */}
      {formattedRelated.length > 0 && (
        <div className="pt-16 border-t border-border/80 mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                আরো অন্যান্য চা কালেকশন
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                গ্রাহকরা এই চায়ের সাথে এগুলোও পছন্দ করেছেন।
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              সবগুলো চা দেখুন →
            </Link>
          </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {formattedRelated.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>  
        </div>
      )}
    </div>
  );
}
