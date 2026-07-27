const db = require('../config/db');

async function list({ page = 1, limit = 20, zone, availableOnly }) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  if (zone) { params.push(zone); where.push(`e.zone = $${params.length}`); }
  if (availableOnly) { where.push("e.current_status = 'available' AND e.is_on_leave = FALSE"); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT e.*, u.name, u.email, u.phone, u.status AS user_status
     FROM executives e JOIN users u ON u.id = e.user_id
     ${whereSql}
     ORDER BY e.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), Number(offset)]
  );
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM executives e JOIN users u ON u.id = e.user_id ${whereSql}`,
    params
  );
  return { rows, total: Number(countRows[0].total) };
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT e.*, u.name, u.email, u.phone
     FROM executives e JOIN users u ON u.id = e.user_id
     WHERE e.id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ userId, employeeId, address, department, zone, skills, vehicleNumber, experienceYears }) {
  const { rows } = await db.query(
    `INSERT INTO executives (user_id, employee_id, address, department, zone, skills, vehicle_number, experience_years)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [userId, employeeId, address, department, zone, skills, vehicleNumber, experienceYears]
  );
  return rows[0].id;
}

async function updateLocation(executiveId, latitude, longitude) {
  await db.query(
    'UPDATE executives SET current_latitude = $1, current_longitude = $2, is_online = TRUE WHERE id = $3',
    [latitude, longitude, executiveId]
  );
  await db.query(
    'INSERT INTO executive_locations (executive_id, latitude, longitude) VALUES ($1, $2, $3)',
    [executiveId, latitude, longitude]
  );
}

async function setLeaveStatus(executiveId, isOnLeave) {
  await db.query('UPDATE executives SET is_on_leave = $1 WHERE id = $2', [isOnLeave, executiveId]);
}

async function remove(id) {
  await db.query('DELETE FROM executives WHERE id = $1', [id]);
}

module.exports = { list, findById, create, updateLocation, setLeaveStatus, remove };
