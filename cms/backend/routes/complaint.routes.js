const router = require('express').Router();
const ctrl = require('../controllers/complaint.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const schemas = require('../validators/complaint.validator');

router.use(authenticate);

/**
 * @openapi
 * /complaints:
 *   get:
 *     summary: List complaints (filterable by status, vendor, executive, priority, category, date range, search)
 *     tags: [Complaints]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create a new complaint (vendor_admin, vendor_sub_user only)
 *     tags: [Complaints]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Complaint created }
 */
router.get('/', ctrl.list); // scoped by role/vendor inside the query in production
router.get('/:id', ctrl.getOne);
router.get('/history/:id', ctrl.history);
router.get('/qrcode/:id', ctrl.qrCode);
router.post('/', authorize('vendor_admin', 'vendor_sub_user'), validate(schemas.createComplaint), ctrl.create);
router.post('/assign', authorize('super_admin'), validate(schemas.assignComplaint), ctrl.assign);
/**
 * @openapi
 * /complaints/status:
 *   post:
 *     summary: Transition a complaint's status (only legal transitions per the state machine are accepted)
 *     tags: [Complaints]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [complaintId, status]
 *             properties:
 *               complaintId: { type: integer }
 *               status:
 *                 type: string
 *                 enum: [open, assigned, accepted, rejected, started, reached_site, in_progress, waiting_for_parts, completed, closed, cancelled]
 *               remarks: { type: string }
 *     responses:
 *       200: { description: Status updated }
 *       409: { description: Invalid transition for the complaint's current status }
 */
router.post('/status', validate(schemas.updateStatus), ctrl.updateStatus);
router.post('/upload/:id', upload.single('file'), ctrl.upload);

module.exports = router;
