import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import type { BookingStatus } from "@/types";

interface Booking {
  id: string;
  assetName?: string | null;
  quantity: number;
  startDate: string;
  endDate: string;
  purpose?: string | null;
  status: BookingStatus;
}

interface BookingTableProps {
  bookings: Booking[];
  showActions?: boolean;
  onAction?: (id: string, status: BookingStatus) => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return "--";
  }
}

export function BookingTable({ bookings, showActions, onAction }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[--muted-fg]">
        No bookings found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Purpose</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow key={b.id}>
            <TableCell className="font-medium text-foreground">{b.assetName ?? "--"}</TableCell>
            <TableCell className="text-foreground">{b.quantity}</TableCell>
            <TableCell className="whitespace-nowrap text-[--muted-fg] text-xs">
              {formatDate(b.startDate)} — {formatDate(b.endDate)}
            </TableCell>
            <TableCell className="max-w-xs truncate text-[--muted-fg] text-xs">
              {b.purpose ?? "--"}
            </TableCell>
            <TableCell>
              <BookingStatusBadge status={b.status} />
            </TableCell>
            {showActions && onAction && (
              <TableCell className="text-right">
                <BookingActionButtons booking={b} onAction={onAction} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BookingActionButtons({
  booking,
  onAction,
}: {
  booking: Booking;
  onAction: (id: string, status: BookingStatus) => void;
}) {
  const { status, id } = booking;

  if (status === "PENDING") {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={() => onAction(id, "APPROVED")}
          className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600 hover:bg-sky-500/20 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => onAction(id, "REJECTED")}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-500/20 transition-colors"
        >
          Reject
        </button>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <button
        onClick={() => onAction(id, "ISSUED")}
        className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600 hover:bg-violet-500/20 transition-colors"
      >
        Issue
      </button>
    );
  }

  if (status === "ISSUED" || status === "OVERDUE") {
    return (
      <button
        onClick={() => onAction(id, "RETURNED")}
        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors"
      >
        Return
      </button>
    );
  }

  return null;
}
