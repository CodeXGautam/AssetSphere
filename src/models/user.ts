import mongoose, { Schema } from "mongoose";
import { ORG_ROLES } from "@/constants";

const UserSchema = new Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // Organisation membership
    orgId:   { type: Schema.Types.ObjectId, ref: "Organisation", default: null },
    orgRole: { type: String, enum: [...ORG_ROLES], default: null },

    // Platform-level superadmin
    isSuperAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    // Ensure missing fields get their defaults when reading old documents
    strict: false,
  }
);

UserSchema.index({ orgId: 1 });

// Always delete the cached model so schema changes take effect on hot reload
if (mongoose.models.User) {
  delete (mongoose.models as Record<string, unknown>).User;
}

export const User = mongoose.model("User", UserSchema);
