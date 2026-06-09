import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models/booking";
import { BOOKING_STATUSES } from "@/constants";

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "#eab308",
  APPROVED: "#3b82f6",
  ISSUED:   "#8b5cf6",
  RETURNED: "#10b981",
  REJECTED: "#ef4444",
  OVERDUE:  "#f97316",
};

export async function GET() {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const counts = await Promise.all(
    BOOKING_STATUSES.map(async (status) => ({
      status,
      count: await Booking.countDocuments({ status }),
      color: STATUS_COLORS[status] ?? "#6366f1",
    }))
  );

  return NextResponse.json({ data: counts });
}
