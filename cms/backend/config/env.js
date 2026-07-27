const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  // Neon/Supabase (and Postgres generally) are configured via a single
  // connection string rather than discrete host/port/user/password fields —
  // this is what both providers hand you directly from their dashboard.
  DATABASE_URL: Joi.string().required(),
  DB_CONNECTION_LIMIT: Joi.number().default(10),
  // Neon/Supabase terminate SSL with certificates from a trusted CA, so
  // rejectUnauthorized:true normally works — but some restrictive local
  // networks/proxies break the chain validation, so this is overridable.
  // Default false matches what both providers' own Node.js quickstart docs
  // recommend to avoid that class of connection failure.
  DB_SSL_REJECT_UNAUTHORIZED: Joi.boolean().default(false),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  SMTP_HOST: Joi.string().allow(''),
  SMTP_PORT: Joi.number().allow(''),
  SMTP_USER: Joi.string().allow(''),
  SMTP_PASSWORD: Joi.string().allow(''),
  SMTP_FROM: Joi.string().allow(''),
  UPLOAD_DIR: Joi.string().default('uploads'),
  MAX_UPLOAD_SIZE_MB: Joi.number().default(10),
  CLIENT_ORIGIN: Joi.string().default('http://localhost:4200'),
  LOGIN_RATE_LIMIT_MAX: Joi.number().default(10),
  LOGIN_RATE_LIMIT_WINDOW_MIN: Joi.number().default(15)
}).unknown(true);

const { error, value: env } = schema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = env;
