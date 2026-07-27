const Joi = require('joi');

const createComplaint = Joi.object({
  category: Joi.string().required(),
  complaintType: Joi.string().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical', 'emergency').default('medium'),
  subject: Joi.string().max(255).required(),
  description: Joi.string().allow(''),
  address: Joi.string().max(255).allow(''),
  landmark: Joi.string().max(150).allow(''),
  latitude: Joi.number().allow(null),
  longitude: Joi.number().allow(null),
  expectedCompletionDate: Joi.date().allow(null)
});

const assignComplaint = Joi.object({
  complaintId: Joi.number().integer().required(),
  executiveId: Joi.number().integer().required()
});

const updateStatus = Joi.object({
  complaintId: Joi.number().integer().required(),
  status: Joi.string().valid(
    'open', 'assigned', 'accepted', 'rejected', 'started', 'reached_site',
    'in_progress', 'waiting_for_parts', 'completed', 'closed', 'cancelled'
  ).required(),
  remarks: Joi.string().allow('')
});

module.exports = { createComplaint, assignComplaint, updateStatus };
