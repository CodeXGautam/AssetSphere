import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/asset";

export const assetService = {
  /**
   * List assets. No orgId filter = platform-wide (browse all).
   * Pass orgId to scope to a specific org.
   */
  async list(filter?: {
    categoryId?: string;
    search?:     string;
    orgId?:      string | null;
  }) {
    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (filter?.orgId) {
      query.orgId = new mongoose.Types.ObjectId(filter.orgId);
    }
    if (filter?.categoryId) {
      query.category = new mongoose.Types.ObjectId(filter.categoryId);
    }
    if (filter?.search) {
      query.$text = { $search: filter.search };
    }

    return Asset.find(query).populate("category").lean();
  },

  async findById(id: string) {
    await connectToDatabase();
    return Asset.findById(id).populate("category").lean();
  },

  async create(input: {
    name:          string;
    categoryId:    string;
    orgId:         string;
    description?:  string;
    imageUrl?:     string;
    totalQuantity: number;
    condition:     string;
    status:        string;
  }) {
    await connectToDatabase();
    const asset = await Asset.create({
      name:              input.name,
      category:          new mongoose.Types.ObjectId(input.categoryId),
      orgId:             new mongoose.Types.ObjectId(input.orgId),
      description:       input.description,
      imageUrl:          input.imageUrl,
      totalQuantity:     input.totalQuantity,
      availableQuantity: input.totalQuantity,
      condition:         input.condition,
      status:            input.status,
    });
    return asset;
  },

  async update(id: string, input: Partial<{
    name:          string;
    categoryId:    string;
    description:   string;
    imageUrl:      string;
    totalQuantity: number;
    condition:     string;
    status:        string;
  }>) {
    await connectToDatabase();
    const update: Record<string, unknown> = { ...input };
    if (input.categoryId) {
      update.category = new mongoose.Types.ObjectId(input.categoryId);
      delete update.categoryId;
    }
    return Asset.findByIdAndUpdate(id, update, { new: true }).populate("category").lean();
  },

  async updateAvailability({ assetId, delta }: { assetId: string; delta: number }) {
    await connectToDatabase();
    return Asset.findByIdAndUpdate(
      assetId,
      { $inc: { availableQuantity: delta } },
      { new: true }
    );
  },
};
