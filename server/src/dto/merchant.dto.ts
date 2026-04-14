import * as Joi from "joi";

export const CreateMerchantDto = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  logo: Joi.string().allow("").optional(),
  category: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  earnRate: Joi.number().min(1).max(1000).required(),
  minSpend: Joi.number().min(0).max(10000).optional(),
  bonusMultiplier: Joi.number().min(1).max(10).optional(),
  redemptionEnabled: Joi.boolean().optional(),
  crossSmeRedemption: Joi.boolean().optional(),
});

export const UpdateMerchantDto = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  logo: Joi.string().allow("").optional(),
  category: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  earnRate: Joi.number().min(1).max(1000).optional(),
  minSpend: Joi.number().min(0).max(10000).optional(),
  bonusMultiplier: Joi.number().min(1).max(10).optional(),
  redemptionEnabled: Joi.boolean().optional(),
  crossSmeRedemption: Joi.boolean().optional(),
  status: Joi.string().valid("ACTIVE", "PAUSED", "ONBOARDING").optional(),
});
