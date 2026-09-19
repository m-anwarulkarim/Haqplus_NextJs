"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Layers,
  Pencil,
  Trash2,
  FolderTree,
  RefreshCw,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: { id: string; name: string; slug: string }[];
  itemCount?: number;
  createdAt?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    parentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", image: "", parentId: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      image: cat.image || "",
      parentId: cat.parentId || "",
    });
    setIsDialogOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory
        ? prev.slug
        : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Category name and slug are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingCategory);
      const url = isEditing
        ? `/api/categories/${editingCategory?.id}`
        : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          image: formData.image.trim() || null,
          parentId: formData.parentId || null,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.error || "Failed to save category");
        return;
      }

      toast.success(
        isEditing ? "Category updated successfully!" : "Category created successfully!"
      );
      setIsDialogOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/categories/${deleteCategory.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.error || "Failed to delete category");
        return;
      }

      toast.success(`Category "${deleteCategory.name}" removed.`);
      setDeleteCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting category");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Category Taxonomy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize catalog hierarchy with root and nested subcategories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            disabled={isLoading}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button onClick={openCreateDialog} className="rounded-xl shadow-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Plus className="size-4" />
            <span>+ Add Category</span>
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search category by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-[50px] text-center font-bold">#</TableHead>
                <TableHead className="w-[70px]">Image</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Hierarchy Type</TableHead>
                <TableHead>Products Linked</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Loading categories...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderTree className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No categories found</p>
                      <p className="text-xs text-muted-foreground">
                        Create your first root category to get started.
                      </p>
                      <Button onClick={openCreateDialog} size="sm" variant="outline" className="mt-2 rounded-xl">
                        Add Category
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => {
                  const isSubcategory = Boolean(category.parentId && category.parent);
                  const createdDate = category.createdAt
                    ? new Date(category.createdAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "01 Sep, 2026";

                  return (
                    <TableRow
                      key={category.id}
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
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <Layers className="size-5" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Category Name */}
                      <TableCell>
                        <span className="font-semibold text-sm text-foreground block">
                          {category.name}
                        </span>
                      </TableCell>

                      {/* Slug */}
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground font-medium">
                          /{category.slug}
                        </span>
                      </TableCell>

                      {/* Hierarchy Type Pill */}
                      <TableCell>
                        {isSubcategory ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {category.parent?.name}
                            </span>
                            <span>&gt;</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                              Subcategory
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            Root Category
                          </span>
                        )}
                      </TableCell>

                      {/* Products Count Badge */}
                      <TableCell>
                        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-xs">
                          {category.itemCount ?? 0} products
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                          {createdDate}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditDialog(category)}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Edit Category"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCategory(category)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Category"
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

        <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>
            Total: <strong className="text-foreground">{filteredCategories.length}</strong> categories
          </span>
          <span>Supports nested subcategories</span>
        </div>
      </div>

      {/* Add / Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                Configure the title, slug, and hierarchical parent for this catalog category.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Category Name *</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Mens Footwear, Electronics, Winter Wear"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-slug">URL Slug *</Label>
                <Input
                  id="cat-slug"
                  placeholder="e.g. mens-footwear"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
                  }
                  required
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-parent">Parent Category (Optional)</Label>
                <select
                  id="cat-parent"
                  value={formData.parentId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                  }
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- None (Make Root Category) --</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Select a parent category if this is a subcategory.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-image">Cover Image URL (Optional)</Label>
                <Input
                  id="cat-image"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {isSubmitting
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={Boolean(deleteCategory)} onOpenChange={(open) => !open && setDeleteCategory(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category{" "}
              <strong className="text-foreground">"{deleteCategory?.name}"</strong>? This will fail if
              there are active products assigned to it.
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
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

