"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Truck,
  Users,
  Megaphone,
  FileText,
  Settings,
  Sparkles,
  Command,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const SEARCH_ITEMS = [
  { name: "Overview / Dashboard", href: "/admin", category: "Navigation", icon: LayoutDashboard },
  { name: "Products List", href: "/admin/products", category: "Catalog", icon: Package },
  { name: "Add New Product", href: "/admin/products/new", category: "Catalog", icon: Package },
  { name: "Category Taxonomy", href: "/admin/categories", category: "Catalog", icon: Layers },
  { name: "Orders & Sales", href: "/admin/orders", category: "Sales", icon: ShoppingCart },
  { name: "Landing Pages", href: "/admin/landing", category: "Marketing", icon: FileText },
  { name: "Bulk Steadfast Courier", href: "/admin/courier", category: "Shipping", icon: Truck },
  { name: "Customer Directory", href: "/admin/customers", category: "Users", icon: Users },
  { name: "Marketing & Pixel", href: "/admin/marketing", category: "Marketing", icon: Megaphone },
  { name: "Courier Settings", href: "/admin/settings/courier", category: "Settings", icon: Settings },
];

export function AdminCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = SEARCH_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {/* Topbar Search Trigger Input matching TailAdmin screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-28 xs:w-40 sm:w-64 md:w-80 h-9 px-2.5 sm:px-3 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/70 hover:border-border transition-all flex items-center justify-between text-xs text-muted-foreground shadow-2xs group cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="truncate">Search or type command...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-lg border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground shadow-2xs">
          <Command className="size-3" />K
        </kbd>
      </button>

      {/* Interactive Command Palette Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
          <div className="flex items-center border-b border-border/80 px-4 py-3 bg-card">
            <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search page..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-card">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No matching admin pages found for &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/70 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.href}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                      {item.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-border/80 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Press <kbd className="font-mono bg-background border px-1 rounded">ESC</kbd> to close</span>
            <span>haqplus Admin Navigation</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
