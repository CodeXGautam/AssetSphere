import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Organisation } from "@/models/organisation";
import { User } from "@/models/user";
import { sendOrgApprovedEmail } from "@/lib/sendgrid";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orgs/[id]/approve
 * Superadmin only — approve a pending org and promote its founder to ORG_ADMIN.
 */
export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  const org = await Organisation.findById(id);
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (org.status !== "PENDING") {
    return NextResponse.json({ error: "Organisation is not pending." }, { status: 409 });
  }

  // Activate org
  await Organisation.findByIdAndUpdate(id, { status: "ACTIVE" });

  // Promote founder to ORG_ADMIN
  const founder = await User.findByIdAndUpdate(
    org.founderId,
    { orgId: org._id, orgRole: "ORG_ADMIN" },
    { new: true }
  );

  if (founder) {
    sendOrgApprovedEmail({ to: founder.email, orgName: org.name }).catch(() => {});
  }

  return NextResponse.json({ message: "Organisation approved." });
}
