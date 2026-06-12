import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorId:  { type: Schema.Types.ObjectId, ref: "User" },
    orgId:    { type: Schema.Types.ObjectId, ref: "Organisation", index: true },
    action:   { type: String, required: true },
    entity:   { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
