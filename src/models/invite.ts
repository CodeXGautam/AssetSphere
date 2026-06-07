import mongoose, { Schema } from "mongoose";

const InviteSchema = new Schema(
  {
    email:      { type: String, required: true, lowercase: true, trim: true },
    orgId:      { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    invitedBy:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    token:      { type: String, required: true, unique: true },
    expiresAt:  { type: Date, required: true },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

InviteSchema.index({ token: 1 });
InviteSchema.index({ email: 1, orgId: 1 });

export const Invite =
  mongoose.models.Invite || mongoose.model("Invite", InviteSchema);
