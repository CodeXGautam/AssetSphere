"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Tag, ArrowRight } from "lucide-react";
import { ConditionBadge } from "@/components/assets/condition-badge";
import { cn } from "@/lib/utils";
import type { AssetCondition } from "@/types";

interface AssetCardProps {
  id:                string;
  name:              string;
  category:          string;
  condition:         AssetCondition;
  availableQuantity: number;
  totalQuantity:     number;
  imageUrl?:         string | null;
  index?:            number;
}

export function AssetCard({
  id, name, category, condition,
  availableQuantity, totalQuantity, imageUrl, index = 0,
}: AssetCardProps) {
  const unavailable = availableQuantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-xl border border-[--border] bg-[--card] transition-colors hover:border-[--fg-subtle]/40"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-[--muted]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={32} className="text-[--muted-fg]" />
          </div>
        )}

        {/* Unavailable overlay */}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full border border-[--border] bg-[--bg]/80 px-3 py-1 text-xs font-medium text-[--fg-muted] backdrop-blur-sm">
              Unavailable
            </span>
          </div>
        )}

        {/* Category chip */}
        <div className="absolute left-2.5 top-2.5">
          <span className="inline-flex items-center gap-1 rounded-md border border-[--border] bg-[--bg]/70 px-2 py-0.5 text-[10px] text-[--fg-muted] backdrop-blur-sm">
            <Tag size={9} />
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-sm font-medium text-foreground">{name}</h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <ConditionBadge condition={condition} />
            <span className={cn(
              "text-xs",
              unavailable ? "text-[--muted-fg]" : "text-foreground/70"
            )}>
              {availableQuantity}/{totalQuantity} avail.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          {/* Book now — goes to detail page with #book anchor */}
          <Link
            href={`/assets/${id}#book`}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              unavailable
                ? "cursor-not-allowed border-[--border] text-[--muted-fg] opacity-50 pointer-events-none"
                : "border-[--primary] bg-[--primary]/10 text-[--primary] hover:bg-[--primary]/20"
            )}
            aria-disabled={unavailable}
          >
            <ArrowRight size={11} />
            Book now
          </Link>

          {/* Details — always active */}
          <Link
            href={`/assets/${id}`}
            className="flex items-center justify-center rounded-lg border border-[--border] bg-[--bg-subtle] px-3 py-2 text-xs text-[--fg-muted] transition-colors hover:border-[--fg-subtle]/40 hover:text-foreground"
          >
            Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
