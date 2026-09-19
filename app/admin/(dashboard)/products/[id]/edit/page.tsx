import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/types";

export const metadata = {
  title: "Edit Product — Admin Portal",
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let dbProduct: any = null;
  let rawCategories: any[] = [];

  try {
    const [fetchedProd, fetchedCats] = await Promise.all([
      prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          category: true,
          variants: true,
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
    ]);
    dbProduct = fetchedProd;
    rawCategories = fetchedCats;
  } catch (err) {
    console.warn("Database lookup failed, falling back to static tea products store:", err);
  }

  // Format categories list
  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image || undefined,
    parentId: c.parentId || undefined,
  }));

  if (categories.length === 0) {
    // No categories found in DB
  }

  let initialData: Product | null = null;

  if (dbProduct) {
    initialData = {
      id: dbProduct.id,
      name: dbProduct.name,
      slug: dbProduct.slug,
      description: dbProduct.description,
      images: dbProduct.images,
      basePrice: Number(dbProduct.basePrice),
      discountPrice: dbProduct.discountPrice ? Number(dbProduct.discountPrice) : undefined,
      price: dbProduct.discountPrice ? Number(dbProduct.discountPrice) : Number(dbProduct.basePrice),
      sku: dbProduct.sku,
      stock: dbProduct.stock,
      categoryId: dbProduct.categoryId,
      category: dbProduct.category?.name || "Black Tea",
      isFeatured: dbProduct.isFeatured,
      isActive: dbProduct.isActive,
      metaTitle: dbProduct.metaTitle || undefined,
      metaDescription: dbProduct.metaDescription || undefined,
      inStock: dbProduct.stock > 0,
      variants: (dbProduct.variants || []).map((v: any) => ({
        id: v.id,
        productId: v.productId,
        size: v.size || undefined,
        color: v.color || undefined,
        price: Number(v.price),
        stock: v.stock,
        sku: v.sku,
      })),
    };
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProductForm initialData={initialData} categories={categories} />
    </div>
  );
}
