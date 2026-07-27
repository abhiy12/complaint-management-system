const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/read', ctrl.markRead);

module.exports = router;
