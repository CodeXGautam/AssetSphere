import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

const schema = z.object({
  email:  z.string().email(),
  secret: z.string(),
});

/**
 * POST /api/debug/promote
 * Promote any user to superadmin using raw MongoDB driver.
 * Protected by SEED_SECRET. DELETE THIS FILE in production.
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

  const conn = await connectToDatabase();

  // Use raw MongoDB collection to bypass any Mongoose schema/cache issues
  const db = conn.connection.db;
  if (!db) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });
  const collection = db.collection("users");

  const result = await collection.findOneAndUpdate(
    { email: parsed.data.email.toLowerCase() },
    { $set: { isSuperAdmin: true, orgId: null, orgRole: null } },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: "User promoted to superadmin.",
    user: {
      id:           result._id.toString(),
      email:        result.email,
      isSuperAdmin: result.isSuperAdmin,
      orgRole:      result.orgRole,
    },
  });
}
