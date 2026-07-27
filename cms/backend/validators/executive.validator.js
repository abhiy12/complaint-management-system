const Joi = require('joi');

const createExecutive = Joi.object({
  name: Joi.string().max(150).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  employeeId: Joi.string().max(30).required(),
  address: Joi.string().max(255).allow(''),
  department: Joi.string().max(100).allow(''),
  zone: Joi.string().max(100).allow(''),
  skills: Joi.string().max(255).allow(''),
  vehicleNumber: Joi.string().max(30).allow(''),
  experienceYears: Joi.number().min(0).default(0)
});

const updateLocation = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required()
});

const applyLeave = Joi.object({
  leaveFrom: Joi.date().required(),
  leaveTo: Joi.date().min(Joi.ref('leaveFrom')).required(),
  leaveType: Joi.string().required(),
  reason: Joi.string().allow('')
});

module.exports = { createExecutive, updateLocation, applyLeave };
