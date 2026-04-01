import * as Joi from "joi";

export const CreateOfferDto = Joi.object({
  merchantId: Joi.string().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(500).allow("").optional(),
  type: Joi.string().valid("bonus", "discount", "freebie").required(),
  value: Joi.number().min(1).max(100).required(),
  startsAt: Joi.date().iso().required(),
  endsAt: Joi.date().iso().greater(Joi.ref("startsAt")).required(),
});

export const UpdateOfferDto = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(500).allow("").optional(),
  type: Joi.string().valid("bonus", "discount", "freebie").optional(),
  value: Joi.number().min(1).max(100).optional(),
  startsAt: Joi.date().iso().optional(),
  endsAt: Joi.date().iso().optional(),
  isActive: Joi.boolean().optional(),
});
