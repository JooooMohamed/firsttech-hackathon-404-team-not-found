import * as Joi from "joi";

export const UpdateProfileDto = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().allow("").optional(),
});
