const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { loginLimiter } = require('../middleware/rateLimiter');
const schemas = require('../validators/auth.validator');

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive an access + refresh token pair
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               rememberMe: { type: boolean }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 *       422: { description: Validation failed }
 */
router.post('/login', loginLimiter, validate(schemas.login), ctrl.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange a valid refresh token for a new access/refresh pair (rotates the token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Token refreshed }
 *       401: { description: Invalid or expired refresh token }
 */
router.post('/refresh', validate(schemas.refresh), ctrl.refresh);

router.post('/logout', ctrl.logout);
router.post('/forgot-password', loginLimiter, validate(schemas.forgotPassword), ctrl.forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), ctrl.resetPassword);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Not authenticated }
 */
router.get('/profile', authenticate, ctrl.profile);

module.exports = router;
