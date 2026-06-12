"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus,
  Package, BookOpen, Clock, AlertTriangle,
  BarChart3, ShieldCheck, Tags, Bell, Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon registry -- use string keys so this can be called from RSC without
// passing a component function across the boundary.
const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  BookOpen,
  Clock,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Tags,
  Bell,
  Layers,
};

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  /** Pass the Lucide icon name as a string, e.g. "Package" */
  icon?: string;
  iconColor?: string;
  index?: number;
}

export function StatCard({
  label,
  value,
  trend,
  trendDirection = "neutral",
  icon,
  iconColor = "text-indigo-400",
  index = 0,
}: StatCardProps) {
  const trendColors = {
    up:      "text-green-400",
    down:    "text-red-400",
    neutral: "text-zinc-500",
  };

  const TrendIcon =
    trendDirection === "up"
      ? TrendingUp
      : trendDirection === "down"
      ? TrendingDown
      : Minus;

  // Resolve icon component from string key inside the Client Component
  const Icon = icon ? (ICON_MAP[icon] ?? null) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-[--border] bg-[--card] p-5 transition-all duration-200 hover:border-[--primary]/30 hover:bg-[--surface]"
    >
      {/* Subtle background glow on hover */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[--primary]/5 blur-2xl transition-all duration-500 group-hover:bg-[--primary]/10" />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-[--muted-fg]">
            {label}
          </span>
          <span className="text-2xl font-semibold text-foreground">{value}</span>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendColors[trendDirection])}>
              <TrendIcon size={11} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn("shrink-0 rounded-xl bg-[--muted] p-2.5", iconColor)}>
            <Icon size={16} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
