import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";
import { Booking } from "@/models/booking";
import { auditLogService } from "@/services/audit-log-service";

export const bookingService = {
  /**
   * List bookings, populating asset name so the UI can display it.
   * If userId is provided, scope to that user. Otherwise return all (admin view).
   */
  async list(userId?: string) {
    await connectToDatabase();
    const query = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "assetId", select: "name imageUrl" })
      .lean();

    // Normalise so callers always get `assetName` as a flat string
    return bookings.map((b) => {
      const asset = b.assetId as { _id: unknown; name?: string; imageUrl?: string } | null;
      return {
        ...b,
        id:        String(b._id),
        assetName: asset?.name ?? null,
        assetImage:asset?.imageUrl ?? null,
      };
    });
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
      });
    });

    session.endSession();
    return bookingRecord;
  },
};
