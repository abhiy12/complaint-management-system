const router = require('express').Router();
const ctrl = require('../controllers/settings.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

const updateSchema = Joi.object({
  key: Joi.string().max(100).required(),
  value: Joi.alternatives(Joi.string(), Joi.number()).required()
});

router.use(authenticate);
router.get('/', authorize('super_admin'), ctrl.list);
router.put('/', authorize('super_admin'), validate(updateSchema), ctrl.update);

module.exports = router;
