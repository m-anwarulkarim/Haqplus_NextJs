import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
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

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const basePriceNum = Number(product.basePrice);
    const discountPriceNum = product.discountPrice ? Number(product.discountPrice) : null;
    const avgRating =
      product.reviews.length > 0
        ? Number(
            (
              product.reviews.reduce((acc, r) => acc + r.rating, 0) /
              product.reviews.length
            ).toFixed(1)
          )
        : 5.0;

    return NextResponse.json({
      ...product,
      basePrice: basePriceNum,
      discountPrice: discountPriceNum,
      price: discountPriceNum ?? basePriceNum,
      originalPrice: discountPriceNum ? basePriceNum : undefined,
      rating: avgRating,
      reviewCount: product.reviews.length,
      inStock: product.stock > 0,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
      reviews: product.reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        userName: r.user?.name || "Customer",
        userImage: r.user?.image || undefined,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Product GET by id error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { variants, ...productData } = result.data;

    // Ensure valid categoryId
    let catId = productData.categoryId;
    try {
      const existingCat = await prisma.category.findUnique({ where: { id: catId } });
      if (!existingCat) {
        const defaultCat = await prisma.category.findFirst();
        if (defaultCat) {
          catId = defaultCat.id;
        } else {
          const newCat = await prisma.category.create({
            data: { name: "Tea", slug: "tea" },
          });
          catId = newCat.id;
        }
      }
    } catch (e) {}

    const updatedData = { ...productData, categoryId: catId };

    // Check if product exists in DB
    const existingProd = await prisma.product.findUnique({ where: { id } }).catch(() => null);

    if (!existingProd) {
      const created = await prisma.product.create({
        data: {
          id,
          ...updatedData,
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
        include: { variants: true },
      });
      return NextResponse.json(created);
    }

    // Transaction to update product and replace variants
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Delete existing variants
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // Update product and create new variants
      return tx.product.update({
        where: { id },
        data: {
          ...updatedData,
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
        include: { variants: true },
      });
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
