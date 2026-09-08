import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { TEA_PRODUCTS } from "@/lib/data/tea-products";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 12)));
    const skip = (page - 1) * limit;

    const includeAll = searchParams.get("all") === "true";
    const where: any = {};
    if (!includeAll) {
      where.isActive = true;
    }

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

    let total = 0;
    let products: any[] = [];

    try {
      const [dbTotal, dbProducts] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            variants: true,
            reviews: { select: { rating: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
      ]);
      if (dbProducts && dbProducts.length > 0) {
        total = dbTotal;
        products = dbProducts;
      }
    } catch (dbErr) {
      console.warn("Products DB fetch fallback:", dbErr);
    }

    if (products.length === 0) {
      // Return HaqPlus tea products fallback
      let teaList = [...TEA_PRODUCTS];
      if (category) {
        teaList = teaList.filter((t) => t.category === category || t.categorySlug === category);
      }
      if (search) {
        const q = search.toLowerCase();
        teaList = teaList.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.bengaliName.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
        );
      }
      if (minPrice !== undefined) {
        teaList = teaList.filter((t) => t.price >= minPrice);
      }
      if (maxPrice !== undefined) {
        teaList = teaList.filter((t) => t.price <= maxPrice);
      }
      total = teaList.length;

      const formattedTeas = teaList.map((t) => ({
        id: t.id,
        name: t.bengaliName || t.name,
        slug: t.slug,
        description: t.description,
        images: t.images,
        basePrice: t.basePrice,
        discountPrice: t.discountPrice,
        price: t.price,
        originalPrice: t.originalPrice,
        sku: t.sku,
        stock: t.stock,
        categoryId: t.category,
        category: t.categoryName,
        categorySlug: t.categorySlug,
        isFeatured: t.isFeatured,
        isActive: t.isActive,
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        rating: t.rating,
        reviewCount: t.reviewCount,
        inStock: t.inStock,
        variants: [
          {
            id: `${t.id}-std`,
            productId: t.id,
            size: t.weight,
            price: t.price,
            stock: t.stock,
            sku: t.sku,
          },
        ],
      }));

      return NextResponse.json({
        products: formattedTeas,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const formattedProducts = products.map((p) => {
      const avgRating =
        p.reviews && p.reviews.length > 0
          ? Number(
              (
                p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
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
        basePrice: basePriceNum,
        discountPrice: discountPriceNum,
        price: discountPriceNum ?? basePriceNum,
        originalPrice: discountPriceNum ? basePriceNum : undefined,
        sku: p.sku,
        stock: p.stock,
        categoryId: p.categoryId,
        category: p.category.name,
        categorySlug: p.category.slug,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        rating: avgRating,
        reviewCount: p.reviews?.length || 0,
        inStock: p.stock > 0,
        variants: p.variants.map((v: any) => ({
          ...v,
          price: Number(v.price),
        })),
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { variants, ...productData } = result.data;

    const newProduct = await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create:
            variants?.map((v) => ({
              size: v.size || null,
              color: v.color || null,
              price: v.price,
              stock: v.stock,
              sku: v.sku,
            })) || [],
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Product create error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this slug or SKU already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
