const router = require('express').Router();
const ctrl = require('../controllers/vendor.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.post('/', authorize('super_admin', 'vendor_admin'), ctrl.createVendorUser);

module.exports = router;
