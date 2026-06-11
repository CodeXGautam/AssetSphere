"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AssetUtilizationChart } from "@/components/charts/asset-utilization";
import { CategoryDistributionChart } from "@/components/charts/category-distribution";
import { StatusDistributionChart } from "@/components/charts/status-distribution";
import { Package, ArrowRight } from "lucide-react";
import type { BookingStatus } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface RecentBooking {
  id:        string;
  _id?:      string;
  assetName: string | null;
  assetId?:  { name?: string } | string;
  quantity:  number;
  status:    BookingStatus;
}

interface AdminStats {
  totalAssets:      number;
  activeBookings:   number;
  pendingRequests:  number;
  overdueReturns:   number;
}

interface UserStats {
  activeBookings: number;
  availableAssets: number;
}

/* ------------------------------------------------------------------ */
/* Admin dashboard                                                      */
/* ------------------------------------------------------------------ */
function AdminDashboard() {
  const [stats,       setStats]       = useState<AdminStats | null>(null);
  const [recent,      setRecent]      = useState<RecentBooking[]>([]);
  const [utilData,    setUtilData]    = useState<{ month: string; bookings: number }[]>([]);
  const [catData,     setCatData]     = useState<{ name: string; value: number }[]>([]);
  const [statusData,  setStatusData]  = useState<{ status: string; count: number; color: string }[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, utilRes, catRes, statusRes, bookingsRes] = await Promise.all([
          fetch("/api/analytics/summary",       { credentials: "include" }),
          fetch("/api/analytics/utilization",   { credentials: "include" }),
          fetch("/api/analytics/categories",    { credentials: "include" }),
          fetch("/api/analytics/booking-status",{ credentials: "include" }),
          fetch("/api/bookings",                { credentials: "include" }),
        ]);

        if (summaryRes.ok) {
          const d = await summaryRes.json();
          setStats({
            totalAssets:     d.totalAssets      ?? 0,
            activeBookings:  d.activeBookings   ?? 0,
            pendingRequests: d.pendingRequests  ?? 0,
            overdueReturns:  d.overdueReturns   ?? 0,
          });
        }

        if (utilRes.ok) {
          const d = await utilRes.json();
          setUtilData(d.data ?? []);
        }

        if (catRes.ok) {
          const d = await catRes.json();
          setCatData(d.data ?? []);
        }

        if (statusRes.ok) {
          const d = await statusRes.json();
          setStatusData(d.data ?? []);
        }

        if (bookingsRes.ok) {
          const { bookings = [] } = await bookingsRes.json();
          setRecent(
            (bookings as RecentBooking[]).slice(0, 5).map((b) => {
              const assetName =
                b.assetName ??
                (typeof b.assetId === "object" && b.assetId !== null
                  ? (b.assetId as { name?: string }).name ?? null
                  : null);
              return {
                id:        b.id ?? b._id ?? "",
                assetName,
                quantity:  b.quantity,
                status:    b.status,
              };
            })
          );
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const s = stats ?? { totalAssets: 0, activeBookings: 0, pendingRequests: 0, overdueReturns: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Overview</h2>
        <p className="mt-0.5 text-xs text-[--muted-fg]">Platform-wide asset and booking status.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Assets"      value={s.totalAssets}      icon="Package"       iconColor="text-foreground/60" index={0} />
        <StatCard label="Active Bookings"   value={s.activeBookings}   icon="BookOpen"      iconColor="text-foreground/60" index={1} />
        <StatCard label="Pending Requests"  value={s.pendingRequests}  icon="Clock"         iconColor="text-foreground/60" index={2} />
        <StatCard label="Overdue Returns"   value={s.overdueReturns}   icon="AlertTriangle" iconColor="text-red-400"       index={3} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Utilization</CardTitle></CardHeader>
          <CardContent><AssetUtilizationChart data={utilData} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Category Distribution</CardTitle></CardHeader>
          <CardContent><CategoryDistributionChart data={catData} /></CardContent>
        </Card>
      </div>

      {/* Status distribution + recent */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Booking Status Distribution</CardTitle></CardHeader>
          <CardContent><StatusDistributionChart data={statusData} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="px-5 py-6 text-xs text-[--muted-fg]">No bookings yet.</p>
            ) : (
              <div className="divide-y divide-[--border]">
                {recent.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {b.assetName ?? "Unknown asset"}
                      </p>
                      <p className="text-[10px] text-[--muted-fg]">qty {b.quantity}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* User dashboard                                                       */
/* ------------------------------------------------------------------ */
function UserDashboard({ name }: { name: string }) {
  const [stats,   setStats]   = useState<UserStats | null>(null);
  const [recent,  setRecent]  = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bookingsRes, assetsRes] = await Promise.all([
          fetch("/api/bookings", { credentials: "include" }),
          fetch("/api/assets",   { credentials: "include" }),
        ]);

        const { bookings = [] } = bookingsRes.ok ? await bookingsRes.json() : {};
        const { assets   = [] } = assetsRes.ok  ? await assetsRes.json()   : {};

        const active    = (bookings as RecentBooking[]).filter((b) => b.status === "ISSUED" || b.status === "APPROVED").length;
        const available = (assets as { availableQuantity: number }[]).filter((a) => a.availableQuantity > 0).length;

        setStats({ activeBookings: active, availableAssets: available });

        setRecent(
          (bookings as RecentBooking[]).slice(0, 5).map((b) => {
            const assetName =
              b.assetName ??
              (typeof b.assetId === "object" && b.assetId !== null
                ? (b.assetId as { name?: string }).name ?? null
                : null);
            return { id: b.id ?? b._id ?? "", assetName, quantity: b.quantity, status: b.status };
          })
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const s = stats ?? { activeBookings: 0, availableAssets: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-base font-semibold text-foreground">Welcome back, {name} 👋</h2>
        <p className="mt-0.5 text-xs text-[--muted-fg]">Here is a summary of your activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="My Active Bookings" value={s.activeBookings}  icon="BookOpen" iconColor="text-foreground/60" index={0} />
        <StatCard label="Available Assets"   value={s.availableAssets} icon="Package"  iconColor="text-foreground/60" index={1} />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <Package size={32} className="mb-2 text-[--muted-fg]" />
              <p className="text-xs text-[--muted-fg]">No bookings yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[--border]">
              {recent.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                      {b.assetName ?? "Unknown asset"}
                    </p>
                    <p className="text-[10px] text-[--muted-fg]">qty {b.quantity}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Link href="/assets">
          <Button className="gap-2">
            Browse Assets
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Entry point                                                          */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.orgRole === "ORG_ADMIN" || session?.user?.isSuperAdmin === true;

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {isAdmin
        ? <AdminDashboard />
        : <UserDashboard name={session?.user?.name ?? "User"} />
      }
    </DashboardLayout>
  );
}
