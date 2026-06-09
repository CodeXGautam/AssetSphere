import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Organisation } from "@/models/organisation";
import { User } from "@/models/user";

/**
 * GET /api/superadmin/orgs
 * Superadmin only — list all organisations with founder info.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;

  await connectToDatabase();

  const query = status ? { status } : {};
  const orgs  = await Organisation.find(query).sort({ createdAt: -1 }).lean();

  // Attach founder details
  const founderIds = orgs.map((o) => o.founderId).filter(Boolean);
  const founders   = await User.find({ _id: { $in: founderIds } }).select("name email").lean();
  const founderMap = Object.fromEntries(founders.map((f) => [String(f._id), f]));

  const result = orgs.map((o) => {
    const founder = founderMap[String(o.founderId)];
    return {
      id:              String(o._id),
      name:            o.name,
      slug:            o.slug,
      email:           o.email,
      status:          o.status,
      rejectedReason:  o.rejectedReason ?? null,
      createdAt:       (o.createdAt as Date).toISOString(),
      founder:         founder ? { name: founder.name, email: founder.email } : null,
    };
  });

  return NextResponse.json({ orgs: result });
}
