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
      <div className="py-12 text-center text-sm text-zinc-600">
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
            <TableCell className="font-medium text-zinc-200">{b.assetName ?? "--"}</TableCell>
            <TableCell>{b.quantity}</TableCell>
            <TableCell className="whitespace-nowrap text-zinc-400 text-xs">
              {formatDate(b.startDate)} -- {formatDate(b.endDate)}
            </TableCell>
            <TableCell className="max-w-xs truncate text-zinc-400 text-xs">
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
          className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => onAction(id, "REJECTED")}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
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
        className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400 hover:bg-violet-500/20 transition-colors"
      >
        Issue
      </button>
    );
  }
  if (status === "ISSUED" || status === "OVERDUE") {
    return (
      <button
        onClick={() => onAction(id, "RETURNED")}
        className="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
      >
        Return
      </button>
    );
  }
  return null;
}
