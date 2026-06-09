import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { isOrgAdmin } from "@/lib/permissions";
import { ORG_ROLES } from "@/constants";

const schema = z.object({ orgRole: z.enum(ORG_ROLES) });
type Params  = { params: Promise<{ id: string }> };

/**
 * PATCH /api/orgs/members/[id]
 * ORG_ADMIN only — promote or demote a member within the same org.
 * SUPERADMIN cannot use this route (no org affiliation).
 */
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isOrgAdmin(session.user.orgRole)) {
    return NextResponse.json({ error: "Only org admins can change member roles." }, { status: 403 });
  }
  if (!session.user.orgId) {
    return NextResponse.json({ error: "No organisation." }, { status: 400 });
  }

  const { id } = await params;
  const body   = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  // Ensure target belongs to same org
  const target = await User.findOne({ _id: id, orgId: session.user.orgId });
  if (!target) {
    return NextResponse.json({ error: "Member not found in your organisation." }, { status: 404 });
  }

  // Prevent demoting yourself if you're the only ORG_ADMIN
  if (
    String(target._id) === session.user.id &&
    parsed.data.orgRole === "MEMBER"
  ) {
    const adminCount = await User.countDocuments({
      orgId:   session.user.orgId,
      orgRole: "ORG_ADMIN",
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot demote the only org admin. Promote another member first." },
        { status: 409 }
      );
    }
  }

  const updated = await User.findByIdAndUpdate(
    id,
    { orgRole: parsed.data.orgRole },
    { new: true, select: "-passwordHash" }
  );

  if (!updated) {
    return NextResponse.json({ error: "Member not found after update." }, { status: 404 });
  }

  return NextResponse.json({
    member: {
      id:      String(updated._id),
      name:    updated.name,
      email:   updated.email,
      orgRole: updated.orgRole,
    },
  });
}
