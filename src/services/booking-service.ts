import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";
import { Booking } from "@/models/booking";
import { auditLogService } from "@/services/audit-log-service";

function normalizeBooking(b: Record<string, unknown>) {
  const asset = b.assetId as { _id: unknown; name?: string; imageUrl?: string } | null;
  return {
    ...b,
    id:         String(b._id),
    assetName:  asset?.name  ?? null,
    assetImage: asset?.imageUrl ?? null,
  };
}

export const bookingService = {
  /**
   * List bookings, populating asset name so the UI can display it.
   * - userId only → scope to that user's own bookings (member view)
   * - orgId only  → all bookings for assets belonging to that org (admin view)
   * - neither     → all bookings (superadmin view)
   */
  async list(userId?: string, orgId?: string) {
    await connectToDatabase();

    if (userId) {
      // Member: their own bookings regardless of org
      const bookings = await Booking.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .populate({ path: "assetId", select: "name imageUrl orgId" })
        .lean();
      return bookings.map(normalizeBooking);
    }

    if (orgId) {
      // Org admin: all bookings for assets in their org only
      // First get asset IDs for this org, then filter bookings
      const { Asset } = await import("@/models/asset");
      const orgAssets = await Asset.find(
        { orgId: new mongoose.Types.ObjectId(orgId) },
        { _id: 1 }
      ).lean();
      const assetIds = orgAssets.map((a) => a._id);

      const bookings = await Booking.find({ assetId: { $in: assetIds } })
        .sort({ createdAt: -1 })
        .populate({ path: "assetId", select: "name imageUrl orgId" })
        .lean();
      return bookings.map(normalizeBooking);
    }

    // Superadmin: everything
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "assetId", select: "name imageUrl orgId" })
      .lean();
    return bookings.map(normalizeBooking);
  },

  async create({
    userId,
    assetId,
    quantity,
    purpose,
    startDate,
    endDate,
  }: {
    userId:    string;
    assetId:   string;
    quantity:  number;
    purpose:   string;
    startDate: string;
    endDate:   string;
  }) {
    await connectToDatabase();

    const session = await mongoose.startSession();
    let bookingRecord: Awaited<ReturnType<typeof Booking.create>>[0] | null = null;

    await session.withTransaction(async () => {
      const asset = await Asset.findById(assetId).session(session);
      if (!asset) throw new Error("Asset not found.");
      if (asset.availableQuantity < quantity) throw new Error("Not enough inventory available.");

      asset.availableQuantity -= quantity;
      await asset.save({ session });

      const [booking] = await Booking.create(
        [{ userId, assetId, quantity, purpose, startDate: new Date(startDate), endDate: new Date(endDate) }],
        { session }
      );

      bookingRecord = booking;

      await auditLogService.record({
        actorId:  userId,
        action:   "BOOKING_CREATED",
        entity:   "Booking",
        entityId: booking._id.toString(),
        orgId:    asset.orgId ? String(asset.orgId) : undefined,
      });
    });

    session.endSession();
    return bookingRecord;
  },
};
