const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userRepo = require('../repositories/user.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const auditLogRepo = require('../repositories/auditLog.repository');
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt');
const { sendMail } = require('../utils/mailer');
const db = require('../config/db');

class HttpError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

function buildTokenPayload(user) {
  return { id: user.id, roleId: user.role_id, roleName: user.role_name, vendorId: user.vendor_id };
}

async function login({ email, password, ip }) {
  const user = await userRepo.findByEmail(email);
  if (!user || user.status !== 'active') {
    throw new HttpError('Invalid email or password', 401);
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new HttpError('Invalid email or password', 401);
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const decoded = verifyRefreshToken(refreshToken);
  await refreshTokenRepo.store({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000)
  });

  await userRepo.updateLastLogin(user.id);
  await auditLogRepo.log({ userId: user.id, module: 'auth', action: 'login', ipAddress: ip });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role_name, vendorId: user.vendor_id }
  };
}

async function refresh({ refreshToken }) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new HttpError('Invalid or expired refresh token', 401);
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenRepo.findValid(tokenHash);
  if (!stored) throw new HttpError('Refresh token has been revoked or reused', 401);

  // Rotate: revoke the old one, issue a new pair
  await refreshTokenRepo.revoke(tokenHash);

  const user = await userRepo.findById(decoded.id);
  if (!user || user.status !== 'active') throw new HttpError('Account is inactive', 401);

  const payload = buildTokenPayload(user);
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);
  const newDecoded = verifyRefreshToken(newRefreshToken);

  await refreshTokenRepo.store({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(newDecoded.exp * 1000)
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout({ refreshToken }) {
  if (refreshToken) {
    await refreshTokenRepo.revoke(hashToken(refreshToken));
  }
}

async function forgotPassword({ email }) {
  const user = await userRepo.findByEmail(email);
  // Always respond success-shaped even if user doesn't exist, to avoid
  // leaking which emails are registered.
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1,$2,$3)',
    [user.id, tokenHash, expiresAt]
  );

  const resetLink = `${process.env.CLIENT_ORIGIN}/auth/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
           <p><a href="${resetLink}">${resetLink}</a></p>`
  });
}

async function resetPassword({ token, newPassword }) {
  const tokenHash = hashToken(token);
  const { rows } = await db.query(
    `SELECT * FROM password_resets WHERE token_hash = $1 AND is_used = FALSE AND expires_at > NOW() LIMIT 1`,
    [tokenHash]
  );
  const record = rows[0];
  if (!record) throw new HttpError('Invalid or expired reset token', 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await userRepo.updatePasswordHash(record.user_id, passwordHash);
  await db.query('UPDATE password_resets SET is_used = TRUE WHERE id = $1', [record.id]);
  await refreshTokenRepo.revokeAllForUser(record.user_id); // force re-login everywhere
}

module.exports = { login, refresh, logout, forgotPassword, resetPassword, HttpError };
