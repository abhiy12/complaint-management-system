const router = require('express').Router();
const ctrl = require('../controllers/vendor.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const schemas = require('../validators/vendor.validator');

router.use(authenticate);

router.get('/', authorize('super_admin'), ctrl.list);
router.get('/:id', authorize('super_admin'), ctrl.getOne);
router.post('/', authorize('super_admin'), validate(schemas.createVendor), ctrl.create);
router.put('/:id', authorize('super_admin'), validate(schemas.updateVendor), ctrl.update);
router.delete('/:id', authorize('super_admin'), ctrl.remove);

module.exports = router;
