import { z } from "zod";

export const earnSchema = z.object({
  amountAed: z.number().min(0.01, "Enter a valid amount"),
  qrToken: z.string().optional(),
});

export type EarnFormData = z.infer<typeof earnSchema>;

export const redeemSchema = z.object({
  points: z.number().int().min(1, "Enter at least 1 point"),
  qrToken: z.string().optional(),
});

export type RedeemFormData = z.infer<typeof redeemSchema>;
