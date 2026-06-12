import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";
import { Booking } from "@/models/booking";
import mongoose from "mongoose";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export async function GET() {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const orgId = session?.user?.orgId;

  // Build booking filter scoped to org's assets
  let bookingFilter: object = {};
  if (orgId && !session?.user?.isSuperAdmin) {
    const orgAssets = await Asset.find(
      { orgId: new mongoose.Types.ObjectId(orgId) },
      { _id: 1 }
    ).lean();
    const assetIds = orgAssets.map((a) => a._id);
    bookingFilter = { assetId: { $in: assetIds } };
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const raw = await Booking.aggregate([
    { $match: { ...bookingFilter, createdAt: { $gte: twelveMonthsAgo } } },
    { $group: {
      _id:   { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 },
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const dataMap = new Map(raw.map((r) => [`${r._id.year}-${r._id.month}`, r.count]));
  const result = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    result.push({ month: MONTHS[d.getMonth()], bookings: dataMap.get(key) ?? 0 });
  }

  return NextResponse.json({ data: result });
}
