import mongoose, { Schema } from "mongoose";
import { BOOKING_STATUSES } from "@/constants";

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
    quantity: { type: Number, required: true },
    purpose: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "PENDING" },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ assetId: 1, status: 1 });

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
