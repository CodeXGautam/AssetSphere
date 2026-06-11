import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const MAP: Record<BookingStatus, { label: string; cls: string }> = {
  PENDING:  { label: "Pending",  cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"  },
  APPROVED: { label: "Approved", cls: "bg-blue-500/15   text-blue-400   border-blue-500/30"    },
  REJECTED: { label: "Rejected", cls: "bg-red-500/15    text-red-400    border-red-500/30"      },
  ISSUED:   { label: "Issued",   cls: "bg-violet-500/15 text-violet-400 border-violet-500/30"  },
  RETURNED: { label: "Returned", cls: "bg-green-500/15  text-green-400  border-green-500/30"   },
  OVERDUE:  { label: "Overdue",  cls: "bg-orange-500/15 text-orange-400 border-orange-500/30"  },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, cls } = MAP[status] ?? MAP.PENDING;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}
