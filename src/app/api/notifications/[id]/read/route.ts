import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/notification";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/notifications/[id]/read
 * Mark a notification as read. Only the owning user may do this.
 */
export async function PATCH(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ notification });
}
