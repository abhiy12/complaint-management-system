const db = require('../config/db');

async function log({ userId, module, action, ipAddress, oldValue, newValue }) {
  await db.query(
    `INSERT INTO audit_logs (user_id, module, action, ip_address, old_value, new_value)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, module, action, ipAddress, oldValue ? JSON.stringify(oldValue) : null, newValue ? JSON.stringify(newValue) : null]
  );
}

async function list({ page = 1, limit = 50, module, userId }) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  if (module) { params.push(module); where.push(`module = $${params.length}`); }
  if (userId) { params.push(userId); where.push(`user_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT * FROM audit_logs ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
}

module.exports = { log, list };
