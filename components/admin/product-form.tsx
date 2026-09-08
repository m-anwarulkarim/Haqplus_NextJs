"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
} from "lucide-react";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import type { Category, Product } from "@/types";

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      images: initialData?.images || [],
      basePrice: initialData?.basePrice || 0,
      discountPrice: initialData?.discountPrice || null,
      sku: initialData?.sku || "",
      stock: initialData?.stock || 0,
      categoryId: initialData?.categoryId || (categories[0]?.id || ""),
      isFeatured: initialData?.isFeatured || false,
      isActive: initialData?.isActive ?? true,
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      variants: initialData?.variants?.map((v) => ({
        id: v.id,
        size: v.size || "",
        color: v.color || "",
        price: v.price,
        stock: v.stock,
        sku: v.sku,
      })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const imagesValue = watch("images");

  // Automatically generate slug from name if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/products/${initialData?.id}`
        : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.error || "Failed to save product");
        setIsSubmitting(false);
        return;
      }

      toast.success(
        isEditing ? "Product updated successfully!" : "Product created successfully!"
      );
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Products List</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            {isEditing ? `Edit: ${initialData?.name}` : "Add New Product"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl shadow-xs gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>{isEditing ? "Update Product" : "Publish Product"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Core Info & Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              General Information
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Product Title *
              </Label>
              <Input
                id="name"
                placeholder="Sony WH-1000XM5 Wireless Headphones"
                className="h-10 rounded-xl"
                {...register("name", { onChange: handleNameChange })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs font-semibold">
                SEO Slug / URL Handle *
              </Label>
              <Input
                id="slug"
                placeholder="sony-wh-1000xm5-wireless-headphones"
                className="h-10 rounded-xl font-mono text-xs"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Product Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed specifications, features, and unboxing details..."
                rows={5}
                className="rounded-xl text-xs leading-relaxed"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Media Images Card (UploadThing) */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Product Media & Images
              </h3>
              <span className="text-xs text-muted-foreground">UploadThing Supported</span>
            </div>

            <ImageUploader
              value={imagesValue || []}
              onChange={(urls) => setValue("images", urls)}
              maxFiles={6}
            />
            {errors.images && (
              <p className="text-xs text-destructive">{errors.images.message}</p>
            )}
          </div>

          {/* Dynamic Variants Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Product Variants (Sizes, Colors, SKUs)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add custom sizes, colors, and specific prices for this product.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({
                    size: "M",
                    color: "Black",
                    price: watch("basePrice") || 99,
                    stock: 10,
                    sku: `${watch("sku") || "SKU"}-${fields.length + 1}`,
                  })
                }
                className="rounded-xl text-xs gap-1.5 h-8"
              >
                <Plus className="size-3.5" />
                <span>Add Variant</span>
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="py-8 text-center rounded-2xl border border-dashed border-border/80 p-4">
                <p className="text-xs text-muted-foreground">
                  No variants added. This product will be sold as a single default standard item.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 p-3 rounded-2xl border border-border/70 bg-muted/20 items-end"
                  >
                    <div className="space-y-1">
                      <Label className="text-[11px]">Size</Label>
                      <Input
                        placeholder="S, M, L"
                        className="h-8 text-xs rounded-lg"
                        {...register(`variants.${idx}.size` as const)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Color</Label>
                      <Input
                        placeholder="Black"
                        className="h-8 text-xs rounded-lg"
                        {...register(`variants.${idx}.color` as const)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Price ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs rounded-lg font-mono"
                        {...register(`variants.${idx}.price` as const)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Stock *</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs rounded-lg font-mono"
                        {...register(`variants.${idx}.stock` as const)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">SKU *</Label>
                      <Input
                        placeholder="VAR-01"
                        className="h-8 text-xs rounded-lg font-mono"
                        {...register(`variants.${idx}.sku` as const)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(idx)}
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Inventory & Category */}
        <div className="space-y-6">
          {/* Organization & Category */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Organization
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category *</Label>
              <select
                {...register("categoryId")}
                className="h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent ? `${c.parent.name} → ${c.name}` : c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs font-semibold">
                Main SKU *
              </Label>
              <Input
                id="sku"
                placeholder="PROD-1001"
                className="h-10 rounded-xl font-mono text-xs"
                {...register("sku")}
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>

            {/* Visibility Settings */}
            <div className="pt-2 border-t border-border/60 space-y-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                  {...register("isFeatured")}
                />
                <span className="font-semibold text-foreground">
                  Feature on Homepage
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                  {...register("isActive")}
                />
                <span className="font-semibold text-foreground">
                  Active (Visible in Store)
                </span>
              </label>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Pricing & Stock
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="basePrice" className="text-xs font-semibold">
                Base Price ($) *
              </Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                placeholder="199.99"
                className="h-10 rounded-xl font-mono text-sm"
                {...register("basePrice")}
              />
              {errors.basePrice && (
                <p className="text-xs text-destructive">{errors.basePrice.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discountPrice" className="text-xs font-semibold">
                Discount / Sale Price ($)
              </Label>
              <Input
                id="discountPrice"
                type="number"
                step="0.01"
                placeholder="159.99 (Optional)"
                className="h-10 rounded-xl font-mono text-sm"
                {...register("discountPrice")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-xs font-semibold">
                Total Available Stock *
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="50"
                className="h-10 rounded-xl font-mono text-sm"
                {...register("stock")}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Search Engine Optimization
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="metaTitle" className="text-xs font-semibold">
                Meta Title
              </Label>
              <Input
                id="metaTitle"
                placeholder="Custom title tag..."
                className="h-9 rounded-xl text-xs"
                {...register("metaTitle")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="metaDescription" className="text-xs font-semibold">
                Meta Description
              </Label>
              <Textarea
                id="metaDescription"
                placeholder="Brief summary for Google search result snippets..."
                rows={2}
                className="rounded-xl text-xs"
                {...register("metaDescription")}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
