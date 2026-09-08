import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Product — Admin Portal",
};

export default async function AdminNewProductPage() {
  let categories: { id: string; name: string; slug: string; image?: string; parentId?: string }[] = [];

  try {
    const rawCategories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    categories = rawCategories.map((c: { id: string; name: string; slug: string; image: string | null; parentId: string | null }) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image || undefined,
      parentId: c.parentId || undefined,
    }));
  } catch (err) {
    console.warn("Could not query categories for new product page:", err);
  }

  return (
    <div className="space-y-6">
      <ProductForm categories={categories} />
    </div>
  );
}
