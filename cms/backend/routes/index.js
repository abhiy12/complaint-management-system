const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/vendors', require('./vendor.routes'));
router.use('/vendor-users', require('./vendorUser.routes'));
router.use('/executives', require('./executive.routes'));
router.use('/complaints', require('./complaint.routes'));
router.use('/reports', require('./report.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/settings', require('./settings.routes'));

module.exports = router;
