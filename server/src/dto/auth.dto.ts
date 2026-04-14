import * as Joi from "joi";

export const RegisterDto = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow("").optional(),
  password: Joi.string().min(4).max(128).required(),
  referralCode: Joi.string().allow("").optional(),
  // roles and merchantId intentionally excluded — assigned server-side only
});

export const LoginDto = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const ConsentDto = Joi.object({
  consentGiven: Joi.boolean().required(),
});

export const MagicLinkRequestDto = Joi.object({
  email: Joi.string().email().required(),
});

export const MagicLinkVerifyDto = Joi.object({
  token: Joi.string().required(),
});
