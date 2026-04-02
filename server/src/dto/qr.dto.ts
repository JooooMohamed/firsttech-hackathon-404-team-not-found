import * as Joi from "joi";

export const CreateQrSessionDto = Joi.object({
  type: Joi.string().valid("earn", "redeem", "general").default("general"),
  merchantId: Joi.string().allow(null).optional(),
  amount: Joi.number().min(0).allow(null).optional(),
});
