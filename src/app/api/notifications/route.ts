import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notificationService } from "@/services/notification-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await notificationService.list(session.user.id);
  return NextResponse.json({ notifications });
}
