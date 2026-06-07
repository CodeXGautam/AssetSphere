import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name:    { type: String, required: true, trim: true },
    orgId:   { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Unique per org (not globally unique)
CategorySchema.index({ name: 1, orgId: 1 }, { unique: true });

export const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
