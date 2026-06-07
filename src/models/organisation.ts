import mongoose, { Schema } from "mongoose";

export type OrgStatus = "PENDING" | "ACTIVE" | "REJECTED";

const OrganisationSchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true }, // official org email
    founderId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
    status:      { type: String, enum: ["PENDING", "ACTIVE", "REJECTED"], default: "PENDING" },
    rejectedReason: { type: String },
  },
  { timestamps: true }
);

OrganisationSchema.index({ slug: 1 });
OrganisationSchema.index({ status: 1 });

export const Organisation =
  mongoose.models.Organisation ||
  mongoose.model("Organisation", OrganisationSchema);
