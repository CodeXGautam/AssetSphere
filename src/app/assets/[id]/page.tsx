"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Tag, Hash, Activity } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ConditionBadge } from "@/components/assets/condition-badge";
import { AssetStatusBadge } from "@/components/ui/badge";
import { AssetRequestForm } from "@/components/forms/asset-request-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetCondition, AssetStatus } from "@/types";

interface Asset {
  _id:               string;
  name:              string;
  description?:      string;
  imageUrl?:         string | null;
  condition:         AssetCondition;
  status:            AssetStatus;
  availableQuantity: number;
  totalQuantity:     number;
  category:          { _id: string; name: string } | null;
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [asset,   setAsset]   = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/assets/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.asset) setAsset(data.asset);
        else setError("Asset not found.");
      })
      .catch(() => setError("Failed to load asset."))
      .finally(() => {
        setLoading(false);
        // Scroll to booking form if #book hash is present
        if (window.location.hash === "#book") {
          setTimeout(() => {
            document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300);
        }
      });
  }, [id]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-5">

        {/* Back + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/assets")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[--border] bg-[--card] text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground"
          >
            <ArrowLeft size={14} />
          </button>
          <nav className="flex items-center gap-1.5 text-xs text-[--muted-fg]">
            <button onClick={() => router.push("/assets")} className="hover:text-foreground transition-colors">
              Assets
            </button>
            <span>/</span>
            <span className="text-foreground">{loading ? "Loading..." : (asset?.name ?? "Not found")}</span>
          </nav>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <Package size={40} className="mb-3 text-[--muted-fg]" />
            <p className="text-sm text-[--muted-fg]">{error}</p>
          </div>
        )}

        {/* Asset content */}
        {!loading && asset && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid gap-6 lg:grid-cols-5"
          >
            {/* Left: image + info */}
            <div className="space-y-4 lg:col-span-3">
              {/* Image */}
              <div className="overflow-hidden rounded-xl border border-[--border] bg-[--muted] aspect-video">
                {asset.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={48} className="text-[--muted-fg]" />
                  </div>
                )}
              </div>

              {/* Details card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{asset.name}</CardTitle>
                      {asset.category && (
                        <p className="mt-1 text-xs text-[--muted-fg]">{asset.category.name}</p>
                      )}
                    </div>
                    <AssetStatusBadge status={asset.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {asset.description && (
                    <p className="text-sm leading-relaxed text-[--muted-fg]">{asset.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 rounded-lg bg-[--muted] px-3 py-2.5">
                      <Tag size={13} className="shrink-0 text-[--muted-fg]" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[--muted-fg]">Category</p>
                        <p className="text-sm font-medium text-foreground">
                          {asset.category?.name ?? "Uncategorised"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-lg bg-[--muted] px-3 py-2.5">
                      <Hash size={13} className="shrink-0 text-[--muted-fg]" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[--muted-fg]">Available</p>
                        <p className="text-sm font-medium text-foreground">
                          {asset.availableQuantity}
                          <span className="text-[--muted-fg]"> / {asset.totalQuantity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-lg bg-[--muted] px-3 py-2.5">
                      <Activity size={13} className="shrink-0 text-[--muted-fg]" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[--muted-fg]">Status</p>
                        <AssetStatusBadge status={asset.status} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-lg bg-[--muted] px-3 py-2.5">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[--muted-fg] mb-1">Condition</p>
                        <ConditionBadge condition={asset.condition} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: booking form */}
            <div className="lg:col-span-2">
              <div id="book" className="scroll-mt-4">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>
                      {asset.availableQuantity === 0 ? "Currently Unavailable" : "Request this Asset"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {asset.availableQuantity === 0 ? (
                      <div className="rounded-lg border border-[--border] bg-[--muted] p-4 text-center">
                        <p className="text-sm text-[--muted-fg]">This asset is currently unavailable.</p>
                        <p className="mt-1 text-xs text-[--muted-fg]">
                          Check back later or browse other assets.
                        </p>
                      </div>
                    ) : (
                      <AssetRequestForm
                        assetId={asset._id}
                        assetName={asset.name}
                        maxQuantity={asset.availableQuantity}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
