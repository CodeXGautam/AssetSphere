"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category { _id: string; name: string; }

interface AssetFiltersProps {
  categories: Category[];
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function AssetFilters({ categories }: AssetFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [search,   setSearch]   = useState(params.get("search")     ?? "");
  const [category, setCategory] = useState(params.get("categoryId") ?? "");
  const debouncedSearch = useDebouncedValue(search, 300);

  const updateParams = useCallback(
    (s: string, c: string) => {
      const p = new URLSearchParams();
      if (s) p.set("search", s);
      if (c) p.set("categoryId", c);
      router.push(`/assets?${p.toString()}`);
    },
    [router]
  );

  useEffect(() => {
    updateParams(debouncedSearch, category);
  }, [debouncedSearch, category, updateParams]);

  const hasFilters = search || category;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--muted-fg]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets..."
          className={cn(
            "h-9 w-full rounded-xl border border-[--border] bg-[--input] pl-9 pr-8 text-sm text-foreground",
            "placeholder:text-[--muted-fg] transition-all",
            "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]"
          )}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--muted-fg] hover:text-foreground"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category select */}
      <div className="relative">
        <SlidersHorizontal size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--muted-fg]" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={cn(
            "h-9 appearance-none rounded-xl border border-[--border] bg-[--input] pl-8 pr-8 text-sm text-foreground",
            "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring] transition-all"
          )}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setCategory(""); }}
          className="flex items-center gap-1.5 rounded-xl border border-[--border] bg-[--muted] px-3 py-2 text-xs text-[--muted-fg] transition-colors hover:text-foreground"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
}
