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

  const [search, setSearch] = useState(params.get("search") ?? "");
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
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets..."
          className={cn(
            "h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-9 pr-8 text-sm",
            "placeholder:text-zinc-600 text-zinc-200 transition-all",
            "focus:border-indigo-500/60 focus:bg-zinc-900",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          )}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category select */}
      <div className="relative">
        <SlidersHorizontal size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={cn(
            "h-9 appearance-none rounded-xl border border-zinc-800 bg-zinc-900/60 pl-8 pr-8 text-sm text-zinc-300",
            "focus:border-indigo-500/60 transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          )}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id} className="bg-zinc-900">{c.name}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setCategory(""); }}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
}
