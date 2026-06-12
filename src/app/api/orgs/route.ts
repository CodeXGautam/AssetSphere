import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Organisation } from "@/models/organisation";
import { userService } from "@/services/user-service";

const createOrgSchema = z.object({
  orgName:       z.string().min(2).max(100),
  orgEmail:      z.string().email(),
  founderName:   z.string().min(2).max(100),
  founderEmail:  z.string().email(),
  password:      z.string().min(8).max(72),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * POST /api/orgs
 * Public — creates a new organisation and its founder user.
 */
export async function POST(request: Request) {
  try {
    const body   = await request.json();
    const parsed = createOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { orgName, orgEmail, founderName, founderEmail, password } = parsed.data;

    await connectToDatabase();

    // Check if founder email already used
    const existingUser = await (await import("@/models/user")).User.findOne({
      email: founderEmail.toLowerCase(),
    });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Generate unique slug
    let slug      = slugify(orgName);
    const exists  = await Organisation.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    const org = await Organisation.create({
      name:      orgName,
      slug,
      email:     orgEmail.toLowerCase(),
      founderId: new (await import("mongoose")).default.Types.ObjectId(), // placeholder
      status:    "ACTIVE",
    });

    // Create founder user (no org access until approved)
    const founder = await userService.createUser({
      name:     founderName,
      email:    founderEmail,
      password,
      orgId:    String(org._id),  // granted on approval
      orgRole:  "ORG_ADMIN",
    });

    // Update org with real founderId
    await Organisation.findByIdAndUpdate(org._id, { founderId: founder.id });

    return NextResponse.json(
      { message: "Organisation application created. You can now sign in." },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
