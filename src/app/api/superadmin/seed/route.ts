import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { userService } from "@/services/user-service";

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  name:     z.string().min(2),
  secret:   z.string(),
});

/**
 * POST /api/superadmin/seed
 * One-time endpoint to create the superadmin user.
 * Protected by a SEED_SECRET env var — only callable if no superadmin exists.
 */
export async function POST(request: Request) {
  const SEED_SECRET = process.env.SEED_SECRET;
  if (!SEED_SECRET) {
    return NextResponse.json({ error: "SEED_SECRET not configured." }, { status: 503 });
  }

  const body   = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 403 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ isSuperAdmin: true });
  if (existing) {
    return NextResponse.json({ error: "Superadmin already exists." }, { status: 409 });
  }

  const user = await userService.createUser({
    name:         parsed.data.name,
    email:        parsed.data.email,
    password:     parsed.data.password,
    isSuperAdmin: true,
  });

  return NextResponse.json(
    { message: "Superadmin created.", user: { id: user.id, email: user.email } },
    { status: 201 }
  );
}
