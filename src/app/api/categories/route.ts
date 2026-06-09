import { NextResponse } from "next/server";
import { categorySchema } from "@/validators/category";
import { categoryService } from "@/services/category-service";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { ConflictError } from "@/lib/errors";

export async function GET() {
  const session    = await auth();
  const orgId      = session?.user?.orgId ?? null;

  // Pass orgId so each org only sees its own categories
  const categories = await categoryService.list(orgId);
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = session?.user?.orgId;
  if (!orgId) {
    return NextResponse.json(
      { error: "You must belong to an organisation to create categories." },
      { status: 400 }
    );
  }

  const body   = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const category = await categoryService.create({ ...parsed.data, orgId });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    if (err instanceof ConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
