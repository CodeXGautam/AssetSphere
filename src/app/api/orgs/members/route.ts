import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { isOrgAdmin, isSuperAdmin } from "@/lib/permissions";

/**
 * GET /api/orgs/members
 * ORG_ADMIN or SUPERADMIN — list members of the caller's org.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canAccess =
    isSuperAdmin(session.user.isSuperAdmin) ||
    isOrgAdmin(session.user.orgRole);

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!session.user.orgId) {
    return NextResponse.json({ error: "No organisation." }, { status: 400 });
  }

  await connectToDatabase();

  const members = await User.find({ orgId: session.user.orgId })
    .select("-passwordHash")
    .sort({ createdAt: 1 })
    .lean();

  const result = members.map((m) => ({
    id:        String(m._id),
    name:      m.name,
    email:     m.email,
    orgRole:   m.orgRole,
    createdAt: (m.createdAt as Date).toISOString(),
  }));

  return NextResponse.json({ members: result });
}
