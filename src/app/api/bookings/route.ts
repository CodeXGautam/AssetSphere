import { NextResponse } from "next/server";
import { bookingSchema } from "@/validators/booking";
import { bookingService } from "@/services/booking-service";
import { auth } from "@/lib/auth";
import { isOrgAdmin, isSuperAdmin } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  const bookings = await bookingService.list(
    (isOrgAdmin(session?.user?.orgRole) || isSuperAdmin(session?.user?.isSuperAdmin))
      ? undefined
      : session?.user?.id
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
