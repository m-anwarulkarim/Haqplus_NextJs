import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  price: z.coerce.number().positive({ message: "Price must be greater than 0" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock cannot be negative" }),
  sku: z.string().min(1, { message: "Variant SKU is required" }),
});

export const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters" }),
  slug: z.string().min(2, { message: "Slug is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  images: z.array(z.string().url()).min(1, { message: "At least one image is required" }),
  basePrice: z.coerce.number().positive({ message: "Base price must be positive" }),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(2, { message: "Product SKU is required" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock cannot be negative" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  variants: z.array(productVariantSchema).optional().default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters" }),
  slug: z.string().min(2, { message: "Slug is required" }),
  image: z.string().url().optional().nullable().or(z.literal("")),
  parentId: z.string().optional().nullable().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
