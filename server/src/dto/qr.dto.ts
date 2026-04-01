import * as Joi from "joi";

export const CreateQrSessionDto = Joi.object({
  type: Joi.string().valid("earn", "redeem").required(),
  merchantId: Joi.string().required(),
  amount: Joi.number().min(0).allow(null).optional(), // points for redeem
});
