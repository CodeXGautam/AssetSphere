import type { BookingStatus, AssetCondition } from "@/types";

/*
 * Badge colours — using /10 bg + /600 text so they are readable
 * on both white (light mode) and near-black (dark mode) backgrounds.
 * The /10 background is light enough not to dominate either theme,
 * and /600 text has sufficient contrast on both.
 */
const STATUS_MAP: Record<BookingStatus, { label: string; cls: string }> = {
  PENDING:  { label: "Pending",  cls: "bg-amber-500/10  text-amber-600  ring-amber-500/25"  },
  APPROVED: { label: "Approved", cls: "bg-sky-500/10    text-sky-600    ring-sky-500/25"    },
  REJECTED: { label: "Rejected", cls: "bg-red-500/10    text-red-600    ring-red-500/25"    },
  ISSUED:   { label: "Issued",   cls: "bg-violet-500/10 text-violet-600 ring-violet-500/25" },
  RETURNED: { label: "Returned", cls: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25" },
  OVERDUE:  { label: "Overdue",  cls: "bg-orange-500/10 text-orange-600 ring-orange-500/25" },
};

const CONDITION_MAP: Record<AssetCondition, { label: string; cls: string }> = {
  EXCELLENT:    { label: "Excellent",    cls: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25" },
  GOOD:         { label: "Good",         cls: "bg-sky-500/10    text-sky-600    ring-sky-500/25"       },
  FAIR:         { label: "Fair",         cls: "bg-amber-500/10  text-amber-600  ring-amber-500/25"     },
  NEEDS_REPAIR: { label: "Needs Repair", cls: "bg-red-500/10    text-red-600    ring-red-500/25"       },
};

const ASSET_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE:      { label: "Active",      cls: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25" },
  MAINTENANCE: { label: "Maintenance", cls: "bg-amber-500/10  text-amber-600  ring-amber-500/25"     },
  RETIRED:     { label: "Retired",     cls: "bg-zinc-500/10   text-zinc-600   ring-zinc-500/25"      },
};

const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`${base} bg-[--muted] text-[--muted-fg] ring-[--border] ${className ?? ""}`} {...props} />;
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, cls } = STATUS_MAP[status] ?? STATUS_MAP.PENDING;
  return <span className={`${base} ${cls}`}>{label}</span>;
}

export function ConditionBadge({ condition }: { condition: AssetCondition }) {
  const { label, cls } = CONDITION_MAP[condition] ?? CONDITION_MAP.GOOD;
  return <span className={`${base} ${cls}`}>{label}</span>;
}

export function AssetStatusBadge({ status }: { status: string }) {
  const { label, cls } = ASSET_STATUS_MAP[status] ?? ASSET_STATUS_MAP.ACTIVE;
  return <span className={`${base} ${cls}`}>{label}</span>;
}
