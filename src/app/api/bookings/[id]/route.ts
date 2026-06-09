import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageAssets } from "@/lib/permissions";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models/booking";
import { Asset } from "@/models/asset";
import { auditLogService } from "@/services/audit-log-service";
import { BOOKING_STATUSES } from "@/constants";
import mongoose from "mongoose";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
});

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/bookings/[id]
 * Transitions booking status with proper inventory side effects:
 *   PENDING  → REJECTED  : restore availableQuantity
 *   APPROVED → ISSUED    : record issuedAt
 *   ISSUED   → RETURNED  : restore availableQuantity
 *   OVERDUE  → RETURNED  : restore availableQuantity
 */
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!canManageAssets(session?.user?.isSuperAdmin, session?.user?.orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body   = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const newStatus = parsed.data.status;

  // --- Fetch current booking ---
  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const oldStatus = booking.status as string;

  // --- Guard invalid transitions ---
  const validTransitions: Record<string, string[]> = {
    PENDING:  ["APPROVED", "REJECTED"],
    APPROVED: ["ISSUED"],
    ISSUED:   ["RETURNED"],
    OVERDUE:  ["RETURNED"],
  };

  if (!validTransitions[oldStatus]?.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${oldStatus} to ${newStatus}.` },
      { status: 409 }
    );
  }

  // --- Mongoose transaction for operations involving inventory ---
  const needsInventoryRestore = newStatus === "RETURNED" || newStatus === "REJECTED";
  const needsIssuedAt         = newStatus === "ISSUED";

  if (needsInventoryRestore) {
    const dbSession = await mongoose.startSession();
    let updatedBooking;

    try {
      await dbSession.withTransaction(async () => {
        // Update booking status
        updatedBooking = await Booking.findByIdAndUpdate(
          id,
          { status: newStatus },
          { new: true, session: dbSession }
        ).lean();

        // Restore inventory
        await Asset.findByIdAndUpdate(
          booking.assetId,
          { $inc: { availableQuantity: booking.quantity } },
          { session: dbSession }
        );
      });
    } finally {
      dbSession.endSession();
    }

    // Record audit log (fire-and-forget)
    const action = newStatus === "RETURNED" ? "ASSET_RETURNED" : "BOOKING_REJECTED";
    auditLogService.record({
      actorId:  session?.user?.id,
      action,
      entity:   "Booking",
      entityId: id,
      metadata: { quantity: booking.quantity, assetId: String(booking.assetId) },
    }).catch(() => {});

    return NextResponse.json({ booking: updatedBooking });
  }

  // --- Simple status update (APPROVED or ISSUED) ---
  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (needsIssuedAt) updatePayload.issuedAt = new Date();

  const updated = await Booking.findByIdAndUpdate(id, updatePayload, { new: true }).lean();

  // Audit log
  const action = newStatus === "APPROVED" ? "BOOKING_APPROVED" : "ASSET_ISSUED";
  auditLogService.record({
    actorId:  session?.user?.id,
    action,
    entity:   "Booking",
    entityId: id,
  }).catch(() => {});

  return NextResponse.json({ booking: updated });
}
