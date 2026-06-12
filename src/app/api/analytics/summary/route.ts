import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";
import { Booking } from "@/models/booking";
import mongoose from "mongoose";

export async function GET() {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const orgId = session?.user?.orgId;

  // Build the org-scoped asset filter
  const assetFilter = orgId && !session?.user?.isSuperAdmin
    ? { orgId: new mongoose.Types.ObjectId(orgId) }
    : {};

  // For booking queries we need the asset IDs belonging to this org
  let bookingAssetFilter: object = {};
  if (orgId && !session?.user?.isSuperAdmin) {
    const orgAssets = await Asset.find(assetFilter, { _id: 1 }).lean();
    const assetIds  = orgAssets.map((a) => a._id);
    bookingAssetFilter = { assetId: { $in: assetIds } };
  }

  const [assetStats, activeBookings, pendingRequests, overdueReturns] = await Promise.all([
    Asset.aggregate([
      { $match: assetFilter },
      { $group: {
        _id:                null,
        totalAssets:        { $sum: 1 },
        availableInventory: { $sum: "$availableQuantity" },
      }},
    ]),
    Booking.countDocuments({ ...bookingAssetFilter, status: { $in: ["APPROVED", "ISSUED"] } }),
    Booking.countDocuments({ ...bookingAssetFilter, status: "PENDING" }),
    Booking.countDocuments({ ...bookingAssetFilter, status: "OVERDUE" }),
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
