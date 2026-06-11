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
  assetId?:  { name?: string } | string;
  quantity:  number;
  startDate: string;
  endDate:   string;
  purpose:   string | null;
  status:    BookingStatus;
}

function normalize(b: Booking): Booking {
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings", { credentials: "include" });
        const { bookings: raw = [] } = res.ok ? await res.json() : {};
        setBookings((raw as Booking[]).map(normalize));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">My Bookings</h2>
          <p className="mt-0.5 text-xs text-[--muted-fg]">
            Track all your asset reservation requests and their status.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            {!loading && (
              <CardDescription>{bookings.length} requests found</CardDescription>
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
              <BookingTable bookings={bookings} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
