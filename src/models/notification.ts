import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, readAt: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
