import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/category";
import { ConflictError } from "@/lib/errors";

export const categoryService = {
  /**
   * List categories for a given org (or all if no orgId supplied — e.g. superadmin).
   */
  async list(orgId?: string | null) {
    await connectToDatabase();
    const query = orgId ? { orgId: new mongoose.Types.ObjectId(orgId) } : {};
    return Category.find(query).sort({ name: 1 }).lean();
  },

  async create({
    name,
    description,
    orgId,
  }: {
    name:         string;
    description?: string;
    orgId:        string;
  }) {
    await connectToDatabase();

    // Check for duplicate name within the same org
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      orgId: new mongoose.Types.ObjectId(orgId),
    });
    if (existing) {
      throw new ConflictError("A category with this name already exists.");
    }

    return Category.create({
      name,
      description,
      orgId: new mongoose.Types.ObjectId(orgId),
    });
  },
};
