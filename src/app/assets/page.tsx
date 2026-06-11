"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetFilters } from "@/components/assets/asset-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import type { AssetCondition } from "@/types";

interface Category {
  _id:  string;
  name: string;
}

interface Asset {
  _id:               string;
  name:              string;
  category:          Category | null;
  condition:         AssetCondition;
  availableQuantity: number;
  totalQuantity:     number;
  imageUrl?:         string | null;
}

function AssetGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[--border] bg-[--card] overflow-hidden">
          <Skeleton className="h-44 rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AssetsContent() {
  const searchParams = useSearchParams();
  const [assets,     setAssets]     = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);

  const categoryId = searchParams.get("categoryId") ?? undefined;
  const search     = searchParams.get("search")     ?? undefined;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryId) params.set("categoryId", categoryId);
        if (search)     params.set("search",     search);
        const qs = params.toString() ? `?${params.toString()}` : "";

        const [aRes, cRes] = await Promise.all([
          fetch(`/api/assets${qs}`,  { credentials: "include" }),
          fetch("/api/categories",   { credentials: "include" }),
        ]);

        const { assets:     a = [] } = aRes.ok ? await aRes.json() : {};
        const { categories: c = [] } = cRes.ok ? await cRes.json() : {};
        setAssets(a);
        setCategories(c);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryId, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Browse Assets</h2>
        <p className="mt-0.5 text-xs text-[--muted-fg]">
          {loading ? "Loading..." : `${assets.length} assets available`}
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-9 w-full" />}>
        <AssetFilters categories={categories} />
      </Suspense>

      {loading ? (
        <AssetGridSkeleton />
      ) : assets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-[--border] bg-[--card] py-16"
        >
          <Package size={40} className="mb-3 text-[--muted-fg]" />
          <p className="text-sm font-medium text-[--muted-fg]">No assets found</p>
          <p className="mt-1 text-xs text-[--muted-fg]">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset, i) => (
            <AssetCard
              key={asset._id}
              id={asset._id}
              name={asset.name}
              category={asset.category?.name ?? "Uncategorized"}
              condition={asset.condition}
              availableQuantity={asset.availableQuantity}
              totalQuantity={asset.totalQuantity}
              imageUrl={asset.imageUrl}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AssetsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<AssetGridSkeleton />}>
        <AssetsContent />
      </Suspense>
    </DashboardLayout>
  );
}
