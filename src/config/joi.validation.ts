import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  PUBLIC_BASE_URL: Joi.string().uri().optional(),
  MONGO_URI: Joi.required(),
  JWT_SECRET: Joi.required(),
  JWT_EXPIRES_IN: Joi.string().default('2h'),
  CORS_ORIGIN: Joi.string().default(
    'http://localhost:4200,http://localhost:4210',
  ),
});
