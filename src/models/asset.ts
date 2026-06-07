import mongoose, { Schema } from "mongoose";
import { ASSET_CONDITIONS, ASSET_STATUSES } from "@/constants";

const AssetSchema = new Schema(
  {
    name:              { type: String, required: true, index: true },
    category:          { type: Schema.Types.ObjectId, ref: "Category", required: true },
    orgId:             { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    description:       { type: String },
    imageUrl:          { type: String },
    totalQuantity:     { type: Number, required: true, min: 1 },
    availableQuantity: { type: Number, required: true, min: 0 },
    condition:         { type: String, enum: ASSET_CONDITIONS, required: true },
    status:            { type: String, enum: ASSET_STATUSES,    required: true, default: "ACTIVE" },
  },
  { timestamps: true }
);

AssetSchema.index({ name: "text", description: "text" });
AssetSchema.index({ orgId: 1, status: 1 });

export const Asset = mongoose.models.Asset || mongoose.model("Asset", AssetSchema);
