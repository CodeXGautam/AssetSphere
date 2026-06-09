import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";
import { Booking } from "@/models/booking";

export async function GET() {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const [assetStats, activeBookings, pendingRequests, overdueReturns] = await Promise.all([
    Asset.aggregate([{
      $group: {
        _id:               null,
        totalAssets:       { $sum: 1 },
        availableInventory:{ $sum: "$availableQuantity" },
      },
    }]),
    Booking.countDocuments({ status: { $in: ["APPROVED", "ISSUED"] } }),
    Booking.countDocuments({ status: "PENDING" }),
    Booking.countDocuments({ status: "OVERDUE" }),
  ]);

  const agg = assetStats[0] ?? { totalAssets: 0, availableInventory: 0 };

  return NextResponse.json({
    totalAssets:        agg.totalAssets,
    availableInventory: agg.availableInventory,
    activeBookings,
    pendingRequests,
    overdueReturns,
  });
}
