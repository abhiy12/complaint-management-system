const Joi = require('joi');

const createVendor = Joi.object({
  vendorName: Joi.string().max(150).required(),
  companyName: Joi.string().max(150).allow(''),
  gstNumber: Joi.string().max(20).allow(''),
  address: Joi.string().max(255).allow(''),
  city: Joi.string().max(100).allow(''),
  state: Joi.string().max(100).allow(''),
  country: Joi.string().max(100).default('India'),
  pinCode: Joi.string().max(10).allow(''),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  contactPerson: Joi.string().max(150).allow(''),
  // Optional: override the default vendor_admin login created alongside the
  // vendor. If omitted, the vendor's own `email` is reused and a random
  // temp password is generated (returned once in the create response).
  defaultUserEmail: Joi.string().email().allow(''),
  defaultUserPassword: Joi.string().min(8).allow('')
});

const updateVendor = createVendor.fork(
  ['vendorName', 'email', 'phone'],
  (s) => s.optional()
).append({
  status: Joi.string().valid('active', 'inactive')
});

module.exports = { createVendor, updateVendor };
