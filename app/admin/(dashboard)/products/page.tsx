"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Package,
  RefreshCw,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import type { Product, Category } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products and categories
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?all=true&limit=100"),
        fetch("/api/categories"),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const sku = product.sku || "";
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      sku.toLowerCase().includes(query)
    );
  });

  // Handle Delete Confirmation
  const handleDelete = async () => {
    if (!deleteProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${deleteProduct.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete product");
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      toast.success(`"${deleteProduct.name}" was successfully removed.`);
      setDeleteProduct(null);
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Product List
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage inventory, categories, pricing, stock levels, and publication dates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button asChild className="rounded-xl shadow-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              <span>+ New Product</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-[50px] text-center font-bold">#</TableHead>
                <TableHead className="w-[70px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Loading product list...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No products found</p>
                      <p className="text-xs text-muted-foreground">
                        Try clearing search or add a new product.
                      </p>
                      <Button asChild size="sm" variant="outline" className="mt-2 rounded-xl">
                        <Link href="/admin/products/new">Add Product</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => {
                  const basePrice = product.basePrice ?? product.price;
                  const stock = product.stock ?? 0;
                  const isDiscounted =
                    product.discountPrice && product.discountPrice < basePrice;
                  const releaseDate = product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "01 Sep, 2026";

                  return (
                    <TableRow
                      key={product.id}
                      className="hover:bg-muted/40 transition-colors border-b border-border/40"
                    >
                      {/* Serial Index with Drag Grip */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground font-mono text-xs">
                          <GripVertical className="size-3.5 opacity-60 cursor-grab" />
                          <span>{index + 1}</span>
                        </div>
                      </TableCell>

                      {/* Thumbnail */}
                      <TableCell>
                        <div className="relative size-12 rounded-xl overflow-hidden bg-muted/60 border border-border/60 shrink-0">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <Package className="size-5" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Product Name */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-semibold text-sm text-foreground hover:text-blue-500 transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </TableCell>

                      {/* SKU */}
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground font-medium">
                          {product.sku || "100"}
                        </span>
                      </TableCell>

                      {/* Category Pill */}
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                          {product.category || "বীজ"}
                        </span>
                      </TableCell>

                      {/* Price (Strikethrough base price & bold sale price) */}
                      <TableCell>
                        <div className="font-mono text-sm">
                          {isDiscounted ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-muted-foreground line-through">
                                ৳{product.basePrice}
                              </span>
                              <span className="font-bold text-blue-500">৳{product.discountPrice}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-blue-500">৳{product.basePrice}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Stock Blue Pill Badge */}
                      <TableCell>
                        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-xs min-w-[42px]">
                          {stock}
                        </span>
                      </TableCell>

                      {/* Stock Status Pill Badge (In Stock / Out of Stock) */}
                      <TableCell>
                        {stock === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-500 dark:text-red-400">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            In Stock
                          </span>
                        )}
                      </TableCell>

                      {/* Date Column */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                          {releaseDate}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Pencil Button */}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="size-4" />
                          </Link>

                          {/* View Preview Button */}
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                            title="Quick View"
                          >
                            <Eye className="size-4" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteProduct(product)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Total Summary Footer */}
        <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing <strong className="text-foreground">{filteredProducts.length}</strong> of{" "}
            <strong className="text-foreground">{products.length}</strong> total products
          </span>
          <span>haqplus Product Inventory</span>
        </div>
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={Boolean(deleteProduct)} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">"{deleteProduct?.name}"</strong>? This will also remove
              all its variants and can break past order history if not handled carefully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

