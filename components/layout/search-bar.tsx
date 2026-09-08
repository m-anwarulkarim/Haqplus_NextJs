"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

const POPULAR_SEARCHES = [
  "শ্রীমঙ্গল সিটিসি ব্ল্যাক টি",
  "অর্গানিক গ্রিন টি",
  "রয়েল মসলা চা",
  "গোল্ডেন টিপ টি",
  "তুলসি আদা চা",
];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="relative flex items-center"
      >
        <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="চা পাতা খুঁজুন (যেমন: সিটিসি ব্ল্যাক টি, গ্রিন টি, মসলা চা)..."
          className="h-10 w-full rounded-full border border-border/80 bg-muted/40 pl-10 pr-16 text-sm text-foreground placeholder:text-muted-foreground/80 transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </form>

      {/* Quick Search Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border bg-popover/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2.5">
            <Flame className="size-3.5 text-orange-500" />
            <span>Trending Searches</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="rounded-full bg-secondary/70 hover:bg-primary/10 hover:text-primary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
