const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/dashboard', authorize('super_admin'), ctrl.dashboard);
router.get('/vendor', authorize('super_admin'), ctrl.vendorReport);
router.get('/executive', authorize('super_admin'), ctrl.executiveReport);
router.get('/export', authorize('super_admin'), ctrl.exportReport);

module.exports = router;
