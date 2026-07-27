const Joi = require('joi');

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rememberMe: Joi.boolean().default(false)
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required()
});

const resetPassword = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const refresh = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = { login, forgotPassword, resetPassword, refresh };
