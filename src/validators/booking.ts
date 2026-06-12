import { z } from "zod";

export const bookingSchema = z.object({
  assetId: z.string().min(1, "Asset is required."),
  quantity: z.number().int().positive(),
  purpose: z.string().min(4, "Purpose is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
});
