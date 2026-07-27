const db = require('../config/db');

async function findByEmail(email) {
  const { rows } = await db.query(
    `SELECT u.*, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1 LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT u.*, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function updateLastLogin(id) {
  await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
}

async function updatePasswordHash(id, hash) {
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
}

async function create({ name, email, phone, passwordHash, roleId, vendorId = null }) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, phone, password_hash, role_id, vendor_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [name, email, phone, passwordHash, roleId, vendorId]
  );
  return rows[0].id;
}

module.exports = { findByEmail, findById, updateLastLogin, updatePasswordHash, create };
