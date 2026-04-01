import * as Joi from "joi";

export const EarnDto = Joi.object({
  merchantId: Joi.string().required(),
  userId: Joi.string().required(), // member receiving points
  amountAed: Joi.number().integer().min(1).required(),
  qrToken: Joi.string().allow(null, "").optional(),
});

export const RedeemDto = Joi.object({
  merchantId: Joi.string().required(),
  userId: Joi.string().required(), // member redeeming
  points: Joi.number().integer().min(1).required(),
  qrToken: Joi.string().allow(null, "").optional(),
});
