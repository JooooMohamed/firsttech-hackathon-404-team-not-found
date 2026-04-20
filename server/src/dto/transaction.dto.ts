import * as Joi from "joi";

export const EarnDto = Joi.object({
  merchantId: Joi.string().required(),
  userId: Joi.string().required(), // member receiving points
  amountAed: Joi.number().integer().min(1).required(),
  qrToken: Joi.string().allow(null, "").optional(),
  idempotencyKey: Joi.string().max(64).optional(),
});

export const RedeemDto = Joi.object({
  merchantId: Joi.string().required(),
  userId: Joi.string().required(), // member redeeming
  points: Joi.number().integer().min(1).required(),
  qrToken: Joi.string().allow(null, "").optional(),
  idempotencyKey: Joi.string().max(64).optional(),
});

export const VoidTransactionDto = Joi.object({
  reason: Joi.string().max(200).optional(),
});
