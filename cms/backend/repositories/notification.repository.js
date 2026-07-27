const db = require('../config/db');

async function create({ userId, title, message, eventType }) {
  const { rows } = await db.query(
    'INSERT INTO notifications (user_id, title, message, event_type) VALUES ($1,$2,$3,$4) RETURNING id',
    [userId, title, message, eventType]
  );
  return rows[0].id;
}

async function listForUser(userId, { unreadOnly = false } = {}) {
  const where = unreadOnly ? 'AND is_read = FALSE' : '';
  const { rows } = await db.query(
    `SELECT * FROM notifications WHERE user_id = $1 ${where} ORDER BY created_at DESC LIMIT 100`,
    [userId]
  );
  return rows;
}

async function markRead(id, userId) {
  await db.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, userId]);
}

module.exports = { create, listForUser, markRead };
