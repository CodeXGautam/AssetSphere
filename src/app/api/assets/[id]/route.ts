import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";
import { assetSchema } from "@/validators/asset";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

/** GET /api/assets/[id] */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  await connectToDatabase();
  const asset = await Asset.findById(id).populate("category").lean();
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ asset });
}

/** PATCH /api/assets/[id] */
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = assetSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.categoryId) {
    update.category = new mongoose.Types.ObjectId(parsed.data.categoryId);
    delete update.categoryId;
  }

  const asset = await Asset.findByIdAndUpdate(id, update, { new: true }).populate("category").lean();
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ asset });
}

/** DELETE /api/assets/[id] */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  const asset = await Asset.findByIdAndDelete(id);
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
