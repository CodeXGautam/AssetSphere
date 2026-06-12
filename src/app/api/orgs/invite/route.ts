import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Invite } from "@/models/invite";
import { Organisation } from "@/models/organisation";
import { User } from "@/models/user";
import { generateInviteToken, inviteExpiry } from "@/lib/invite-token";
import { sendInviteEmail } from "@/lib/sendgrid";
import { isOrgAdmin } from "@/lib/permissions";

const schema = z.object({ email: z.string().email() });

/**
 * POST /api/orgs/invite
 * ORG_ADMIN only — send an email invite to a new member.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isOrgAdmin(session.user.orgRole)) {
    return NextResponse.json({ error: "Only org admins can invite members." }, { status: 403 });
  }
  if (!session.user.orgId) {
    return NextResponse.json({ error: "You are not associated with an organisation." }, { status: 400 });
  }

  const body   = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email } = parsed.data;
  await connectToDatabase();

  // Check if user already in any org
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing?.orgId) {
    return NextResponse.json({ error: "This user is already part of an organisation." }, { status: 409 });
  }

  // Cancel any existing pending invite for this email + org
  await Invite.deleteOne({ email: email.toLowerCase(), orgId: session.user.orgId, acceptedAt: null });

  const org = await Organisation.findById(session.user.orgId);
  if (!org) return NextResponse.json({ error: "Organisation not found." }, { status: 404 });

  const inviter = await User.findById(session.user.id).select("name");

  const token  = generateInviteToken();
  await Invite.create({
    email:     email.toLowerCase(),
    orgId:     session.user.orgId,
    invitedBy: session.user.id,
    token,
    expiresAt: inviteExpiry(),
  });

  const appUrl    = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;

  let emailError: string | null = null;
  try {
    await sendInviteEmail({
      to:          email,
      orgName:     org.name,
      inviterName: inviter?.name ?? "An admin",
      token,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    emailError = e?.message ?? "Email delivery failed";
    console.error("[invite] sendInviteEmail failed — token still valid:", { email, inviteUrl, error: emailError });
  }

  return NextResponse.json(
    {
      message:   emailError
        ? `Invite created but email delivery failed. Share this link manually: ${inviteUrl}`
        : `Invite sent to ${email}.`,
      inviteUrl, // always returned — handy for dev/staging even when email works
      emailError: emailError ?? undefined,
    },
    { status: 201 }
  );
}
