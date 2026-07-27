const db = require('../config/db');

async function getAll() {
  const { rows } = await db.query('SELECT "key", value, description FROM settings ORDER BY "key"');
  return rows;
}

async function getByKey(key) {
  const { rows } = await db.query('SELECT "key", value, description FROM settings WHERE "key" = $1 LIMIT 1', [key]);
  return rows[0] || null;
}

async function upsert(key, value, description) {
  await db.query(
    `INSERT INTO settings ("key", value, description) VALUES ($1, $2, $3)
     ON CONFLICT ("key") DO UPDATE SET value = EXCLUDED.value,
       description = COALESCE(EXCLUDED.description, settings.description)`,
    [key, value, description || null]
  );
}

module.exports = { getAll, getByKey, upsert };
