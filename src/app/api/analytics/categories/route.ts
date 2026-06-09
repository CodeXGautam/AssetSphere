import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";

export async function GET() {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const raw = await Asset.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
    { $project: { name: { $arrayElemAt: ["$cat.name", 0] }, count: 1 } },
    { $sort: { count: -1 } },
  ]);

  const data = raw.map((r) => ({ name: r.name ?? "Uncategorised", value: r.count as number }));
  return NextResponse.json({ data });
}
