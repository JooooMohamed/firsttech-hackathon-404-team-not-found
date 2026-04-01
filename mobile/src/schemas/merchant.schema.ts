import { z } from "zod";

export const merchantSetupSchema = z.object({
  name: z.string().min(2, "Merchant name is required"),
  logo: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  earnRate: z.number().min(1).max(1000),
  redemptionEnabled: z.boolean().optional(),
  crossSmeRedemption: z.boolean().optional(),
});

export type MerchantSetupFormData = z.infer<typeof merchantSetupSchema>;
