import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";

/**
 * GET /api/admin/users
 * Returns all users. Admin only.
 */
export async function GET() {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const users = await User.find()
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  const serialized = users.map((u) => ({
    id:          (u._id as { toString(): string }).toString(),
    name:        u.name,
    email:       u.email,
    orgRole:     u.orgRole,
    isSuperAdmin: u.isSuperAdmin,
    createdAt:   (u.createdAt as Date).toISOString(),
  }));

  return NextResponse.json({ users: serialized });
}
