const router = require('express').Router();
const ctrl = require('../controllers/executive.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const schemas = require('../validators/executive.validator');

router.use(authenticate);

router.get('/', authorize('super_admin'), ctrl.list);
router.get('/:id', authorize('super_admin', 'executive'), ctrl.getOne);
router.post('/', authorize('super_admin'), validate(schemas.createExecutive), ctrl.create);
router.post('/location', authorize('executive'), validate(schemas.updateLocation), ctrl.updateLocation);
router.post('/leave', authorize('executive'), validate(schemas.applyLeave), ctrl.applyLeave);
router.put('/leave/:leaveId/approve', authorize('super_admin'), ctrl.approveLeave);

module.exports = router;
