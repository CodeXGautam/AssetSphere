"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { BookingTable } from "@/components/bookings/booking-table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingStatus } from "@/types";

interface Booking {
  id:        string;
  _id?:      string;
  assetName: string | null;
  quantity:  number;
  startDate: string;
  endDate:   string;
  purpose:   string | null;
  status:    BookingStatus;
  assetId?:  { name?: string } | string;
}

function normalize(b: Booking): Booking {
  // The populated booking may have assetId as an object with a name field
  const assetName =
    b.assetName ??
    (typeof b.assetId === "object" && b.assetId !== null
      ? (b.assetId as { name?: string }).name ?? null
      : null);

  return {
    id:        b.id ?? b._id ?? "",
    assetName,
    quantity:  b.quantity,
    startDate: b.startDate,
    endDate:   b.endDate,
    purpose:   b.purpose,
    status:    b.status,
  };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", { credentials: "include" });
      const { bookings: raw = [] } = res.ok ? await res.json() : {};
      setBookings((raw as Booking[]).map(normalize));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function handleAction(id: string, status: BookingStatus) {
    await fetch(`/api/bookings/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    await loadBookings();
  }

  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const overdue = bookings.filter((b) => b.status === "OVERDUE").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Booking Approvals</h2>
          <p className="mt-0.5 text-xs text-[--muted-fg]">
            {loading
              ? "Loading..."
              : pending > 0 || overdue > 0
              ? [
                  pending > 0 && `${pending} pending`,
                  overdue > 0 && `${overdue} overdue`,
                ]
                  .filter(Boolean)
                  .join(", ") + " across all users."
              : "All caught up."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            {!loading && (
              <CardDescription>{bookings.length} total requests</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <BookingTable
                bookings={bookings}
                showActions
                onAction={handleAction}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
