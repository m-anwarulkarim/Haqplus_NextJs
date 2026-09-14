"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Flame, Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const POPULAR_SEARCHES = [
  "শ্রীমঙ্গল সিটিসি ব্ল্যাক টি",
  "অর্গানিক গ্রিন টি",
  "রয়েল মসলা চা",
  "গোল্ডেন টিপ টি",
  "তুলসি আদা চা",
];

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcuts (Cmd+K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced Live Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <>
      {/* Trigger Button (Looks like an input) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative flex h-10 w-full max-w-sm items-center rounded-full border border-border/60 bg-muted/30 px-3.5 text-sm text-muted-foreground transition-all hover:border-emerald-600/40 hover:bg-emerald-500/5 hover:ring-2 hover:ring-emerald-500/20"
      >
        <Search className="mr-2 size-4 opacity-70 group-hover:text-emerald-600" />
        <span className="flex-1 text-left">চা পাতা খুঁজুন...</span>
        <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground shadow-2xs group-hover:text-emerald-700">
          ⌘K
        </kbd>
      </button>

      {/* Fullscreen Search Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Close Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-top-10 zoom-in-95 duration-200">
            {/* Search Input Area */}
            <div className="flex items-center border-b border-border/80 px-4 py-3">
              <Search className="size-5 text-emerald-600" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch(query);
                  }
                }}
                placeholder="চা পাতা, ক্যাটাগরি বা ব্র্যান্ড খুঁজুন..."
                className="flex-1 bg-transparent px-4 py-2 text-base sm:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {isSearching ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            {/* Scrollable Results Area */}
            <div className="max-h-[60vh] sm:max-h-[500px] overflow-y-auto overscroll-contain p-2 sm:p-4 bg-muted/10">
              
              {!query.trim() && (
                <div className="p-2 sm:p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">
                    <Flame className="size-4" />
                    <span>Trending Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setQuery(item);
                          handleSearch(item);
                        }}
                        className="rounded-full border border-border/50 bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-all hover:border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && results.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Products
                  </div>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-all hover:bg-emerald-500/10 active:bg-emerald-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-white">
                          <Image
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground group-hover:text-emerald-700 transition-colors">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-emerald-600">
                          ৳{product.price}
                        </span>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background opacity-0 shadow-sm transition-all group-hover:opacity-100 group-hover:text-emerald-600">
                          <ArrowRight className="size-4" />
                        </div>
                      </div>
                    </Link>
                  ))}

                  <button
                    onClick={() => handleSearch(query)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600/10 px-4 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
                  >
                    <Search className="size-4" />
                    "{query}" এর সব রেজাল্ট দেখুন
                  </button>
                </div>
              )}

              {query.trim() && !isSearching && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50">
                    <Search className="size-6 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">কোনো ফলাফল পাওয়া যায়নি</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    "{query}" লিখে কোনো চা পাতা পাওয়া যায়নি। অন্য কিছু লিখে খুঁজুন।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
