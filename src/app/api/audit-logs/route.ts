import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { auditLogService } from "@/services/audit-log-service";

export async function GET() {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Superadmin sees all logs; org admins see only their org's logs
  const orgId = session?.user?.isSuperAdmin ? null : (session?.user?.orgId ?? null);
  const logs  = await auditLogService.list(orgId);
  return NextResponse.json({ logs });
}
