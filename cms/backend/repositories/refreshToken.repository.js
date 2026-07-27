const db = require('../config/db');

async function store({ userId, tokenHash, expiresAt }) {
  await db.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

async function findValid(tokenHash) {
  const { rows } = await db.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND is_revoked = FALSE AND expires_at > NOW() LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function revoke(tokenHash) {
  await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1', [tokenHash]);
}

async function revokeAllForUser(userId) {
  await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1', [userId]);
}

module.exports = { store, findValid, revoke, revokeAllForUser };
