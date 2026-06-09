import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Invite } from "@/models/invite";
import { Organisation } from "@/models/organisation";
import { userService } from "@/services/user-service";
import { User } from "@/models/user";

type Params = { params: Promise<{ token: string }> };

/**
 * GET /api/invite/[token]
 * Public — validate a token and return invite details (org name, email).
 */
export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;
  await connectToDatabase();

  const invite = await Invite.findOne({ token });
  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link." }, { status: 404 });
  }
  if (invite.acceptedAt) {
    return NextResponse.json({ error: "This invite has already been used." }, { status: 409 });
  }
  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "This invite link has expired." }, { status: 410 });
  }

  const org = await Organisation.findById(invite.orgId).select("name").lean<{ name: string } | null>();

  return NextResponse.json({
    email:   invite.email,
    orgName: org?.name ?? "Unknown Organisation",
    token,
  });
}

const acceptSchema = z.object({
  name:     z.string().min(2).max(100),
  password: z.string().min(8).max(72),
});

/**
 * POST /api/invite/[token]
 * Public — accept an invite, create/update user, join org as MEMBER.
 */
export async function POST(request: Request, { params }: Params) {
  const { token } = await params;
  const body      = await request.json();
  const parsed    = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const invite = await Invite.findOne({ token });
  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link." }, { status: 404 });
  }
  if (invite.acceptedAt) {
    return NextResponse.json({ error: "This invite has already been used." }, { status: 409 });
  }
  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "This invite link has expired." }, { status: 410 });
  }

  const { name, password } = parsed.data;

  // Check if email already has an account
  const existing = await User.findOne({ email: invite.email });
  if (existing) {
    // Update existing user to join org
    await User.findByIdAndUpdate(existing._id, {
      orgId:   invite.orgId,
      orgRole: "MEMBER",
    });
  } else {
    await userService.createUser({
      name,
      email:   invite.email,
      password,
      orgId:   String(invite.orgId),
      orgRole: "MEMBER",
    });
  }

  // Mark invite as accepted
  await Invite.findByIdAndUpdate(invite._id, { acceptedAt: new Date() });

  return NextResponse.json({ message: "Welcome! Your account is ready. Please sign in." });
}
