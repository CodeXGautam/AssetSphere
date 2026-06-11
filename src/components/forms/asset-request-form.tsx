"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookingSchema } from "@/validators/booking";
import { cn } from "@/lib/utils";

type BookingValues = z.infer<typeof bookingSchema>;

interface AssetRequestFormProps {
  assetId: string;
  assetName: string;
  maxQuantity?: number;
}

export function AssetRequestForm({ assetId, assetName, maxQuantity = 99 }: AssetRequestFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      assetId,
      quantity: 1,
      purpose: "",
      startDate: today,
      endDate: "",
    },
  });

  async function onSubmit(values: BookingValues) {
    setStatus("loading");
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const d = await res.json();
        setServerError(d.error ?? "Booking failed");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setServerError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-8 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle2 size={24} className="text-green-400" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Request submitted!</h3>
        <p className="text-sm text-zinc-500">Your booking for <span className="text-zinc-300">{assetName}</span> is pending approval.</p>
        <Button variant="outline" size="sm" onClick={() => { setStatus("idle"); form.reset(); }}>
          Make another request
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Quantity */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Quantity</label>
        <input
          {...form.register("quantity", { valueAsNumber: true })}
          type="number"
          min={1}
          max={maxQuantity}
          className={cn(
            "h-10 w-full rounded-xl border bg-zinc-900/60 px-3 text-sm text-foreground",
            "border-zinc-800 focus:border-indigo-500/60 placeholder:text-zinc-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
            form.formState.errors.quantity && "border-red-500/60"
          )}
        />
        {form.formState.errors.quantity && (
          <p className="text-xs text-red-400">{form.formState.errors.quantity.message}</p>
        )}
      </div>

      {/* Purpose */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Purpose</label>
        <textarea
          {...form.register("purpose")}
          rows={3}
          placeholder="Describe why you need this asset..."
          className={cn(
            "w-full rounded-xl border bg-zinc-900/60 px-3 py-2.5 text-sm text-foreground resize-none",
            "border-zinc-800 focus:border-indigo-500/60 placeholder:text-zinc-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
            form.formState.errors.purpose && "border-red-500/60"
          )}
        />
        {form.formState.errors.purpose && (
          <p className="text-xs text-red-400">{form.formState.errors.purpose.message}</p>
        )}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Start date</label>
          <div className="relative">
            <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              {...form.register("startDate")}
              type="date"
              min={today}
              className={cn(
                "h-10 w-full rounded-xl border bg-zinc-900/60 pl-9 pr-3 text-sm text-foreground",
                "border-zinc-800 focus:border-indigo-500/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
                form.formState.errors.startDate && "border-red-500/60"
              )}
            />
          </div>
          {form.formState.errors.startDate && (
            <p className="text-xs text-red-400">{form.formState.errors.startDate.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">End date</label>
          <div className="relative">
            <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              {...form.register("endDate")}
              type="date"
              min={today}
              className={cn(
                "h-10 w-full rounded-xl border bg-zinc-900/60 pl-9 pr-3 text-sm text-foreground",
                "border-zinc-800 focus:border-indigo-500/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
                form.formState.errors.endDate && "border-red-500/60"
              )}
            />
          </div>
          {form.formState.errors.endDate && (
            <p className="text-xs text-red-400">{form.formState.errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Server error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5"
          >
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        loading={status === "loading"}
        className="w-full bg-indigo-600 hover:bg-indigo-500"
      >
        Submit request
      </Button>
    </form>
  );
}
