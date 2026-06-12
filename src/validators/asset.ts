import { z } from "zod";
import { ASSET_CONDITIONS, ASSET_STATUSES } from "@/constants";

export const assetSchema = z.object({
  name: z.string().min(2, "Name is required."),
  categoryId: z.string().min(1, "Category is required."),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  totalQuantity: z.number().int().positive(),
  condition: z.enum(ASSET_CONDITIONS),
  status: z.enum(ASSET_STATUSES),
});
