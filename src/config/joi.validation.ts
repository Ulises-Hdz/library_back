import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.required(),
  JWT_SECRET: Joi.required(),
  JWT_EXPIRES_IN: Joi.string().default('2h'),
});
