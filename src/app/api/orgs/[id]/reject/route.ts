import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Organisation } from "@/models/organisation";
import { User } from "@/models/user";
import { sendOrgRejectedEmail } from "@/lib/sendgrid";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({ reason: z.string().optional() });

/**
 * POST /api/orgs/[id]/reject
 * Superadmin only — reject a pending org application.
 */
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body   = await request.json().catch(() => ({}));
  const { reason } = schema.parse(body);

  await connectToDatabase();

  const org = await Organisation.findById(id);
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Organisation.findByIdAndUpdate(id, { status: "REJECTED", rejectedReason: reason ?? "" });

  const founder = await User.findById(org.founderId);
  if (founder) {
    sendOrgRejectedEmail({ to: founder.email, orgName: org.name, reason }).catch(() => {});
  }

  return NextResponse.json({ message: "Organisation rejected." });
}
