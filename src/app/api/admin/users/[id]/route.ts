import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { z } from "zod";

const patchSchema = z.object({
  orgRole: z.enum(["ORG_ADMIN", "MEMBER"]),
});

/**
 * PATCH /api/admin/users/[id]
 * Toggle a user's role. Admin only.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findByIdAndUpdate(
    id,
    { orgRole: parsed.data.orgRole },
    { new: true, select: "-passwordHash" }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id:        user._id.toString(),
      name:      user.name,
      email:     user.email,
      orgRole:   user.orgRole,
      createdAt: (user.createdAt as Date).toISOString(),
    },
  });
}
