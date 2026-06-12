import { NextResponse } from "next/server";
import { bookingSchema } from "@/validators/booking";
import { bookingService } from "@/services/booking-service";
import { auth } from "@/lib/auth";
import { isOrgAdmin, isSuperAdmin } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  const userId  = session?.user?.id;
  const orgId   = session?.user?.orgId ?? undefined;

  const isAdmin = isOrgAdmin(session?.user?.orgRole) || isSuperAdmin(session?.user?.isSuperAdmin);

  // Admins see all bookings for their org's assets; members see only their own
  const bookings = await bookingService.list(
    isAdmin ? undefined : userId,
    // Pass orgId so admin list is still scoped to their org (not platform-wide)
    isAdmin ? orgId : undefined
  );
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const booking = await bookingService.create({
    userId: session.user.id,
    ...parsed.data,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
