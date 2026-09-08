import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/product";
import { TEA_CATEGORIES } from "@/lib/data/tea-products";

export async function GET() {
  try {
    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      });
    } catch (e) {
      console.warn("Categories DB query fallback to TEA_CATEGORIES:", e);
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        TEA_CATEGORIES.map((c) => ({
          id: c.id,
          name: c.bengaliName || c.name,
          slug: c.slug,
          image: c.image,
          parentId: null,
          itemCount: 4,
        }))
      );
    }

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      parentId: c.parentId,
      parent: c.parent,
      children: c.children,
      itemCount: c._count.products,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      TEA_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.bengaliName || c.name,
        slug: c.slug,
        image: c.image,
        parentId: null,
        itemCount: 4,
      }))
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, image, parentId } = result.data;

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        image: image || null,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error("Category create error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
