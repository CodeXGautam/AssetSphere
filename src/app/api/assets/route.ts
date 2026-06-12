import { NextResponse } from "next/server";
import { assetSchema } from "@/validators/asset";
import { assetService } from "@/services/asset-service";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const search     = searchParams.get("search")     ?? undefined;

  // Assets are scoped to the user's org — members only see their own org's assets
  const orgId = session?.user?.orgId ?? undefined;
  const assets = await assetService.list({ categoryId, search, orgId });
  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = session?.user?.orgId;
  if (!orgId && !session?.user?.isSuperAdmin) {
    return NextResponse.json(
      { error: "You must belong to an organisation to add assets." },
      { status: 400 }
    );
  }
  if (!orgId) {
    return NextResponse.json(
      { error: "Superadmin must specify an orgId when creating assets. Use the org-scoped admin panel." },
      { status: 400 }
    );
  }

  const body   = await request.json();
  const parsed = assetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const asset = await assetService.create({ ...parsed.data, orgId });
  return NextResponse.json({ asset }, { status: 201 });
}
