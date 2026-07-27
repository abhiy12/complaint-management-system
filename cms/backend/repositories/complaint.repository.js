const db = require('../config/db');

async function countToday() {
  const { rows } = await db.query(
    "SELECT COUNT(*) AS total FROM complaints WHERE created_at::date = CURRENT_DATE"
  );
  return Number(rows[0].total);
}

async function create(c) {
  const { rows } = await db.query(
    `INSERT INTO complaints (complaint_number, vendor_id, vendor_user_id, category, complaint_type,
       priority, subject, description, address, landmark, latitude, longitude, expected_completion_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'open') RETURNING id`,
    [c.complaintNumber, c.vendorId, c.vendorUserId, c.category, c.complaintType, c.priority,
     c.subject, c.description, c.address, c.landmark, c.latitude, c.longitude, c.expectedCompletionDate]
  );
  return rows[0].id;
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT c.*, v.vendor_name, eu.name AS executive_name
     FROM complaints c
     JOIN vendors v ON v.id = c.vendor_id
     LEFT JOIN executives e ON e.id = c.assigned_executive_id
     LEFT JOIN users eu ON eu.id = e.user_id
     WHERE c.id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function list({ page = 1, limit = 20, status, vendorId, executiveId, priority, category, from, to, search }) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  if (status) { params.push(status); where.push(`c.status = $${params.length}`); }
  if (vendorId) { params.push(vendorId); where.push(`c.vendor_id = $${params.length}`); }
  if (executiveId) { params.push(executiveId); where.push(`c.assigned_executive_id = $${params.length}`); }
  if (priority) { params.push(priority); where.push(`c.priority = $${params.length}`); }
  if (category) { params.push(category); where.push(`c.category = $${params.length}`); }
  if (from) { params.push(from); where.push(`c.created_at >= $${params.length}`); }
  if (to) { params.push(to); where.push(`c.created_at <= $${params.length}`); }
  if (search) {
    params.push(`%${search}%`, `%${search}%`);
    where.push(`(c.complaint_number ILIKE $${params.length - 1} OR c.subject ILIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT c.*, v.vendor_name, eu.name AS executive_name
     FROM complaints c
     JOIN vendors v ON v.id = c.vendor_id
     LEFT JOIN executives e ON e.id = c.assigned_executive_id
     LEFT JOIN users eu ON eu.id = e.user_id
     ${whereSql}
     ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), Number(offset)]
  );
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM complaints c ${whereSql}`, params
  );
  return { rows, total: Number(countRows[0].total) };
}

async function updateStatus(id, status) {
  await db.query('UPDATE complaints SET status = $1 WHERE id = $2', [status, id]);
}

async function assignExecutive(id, executiveId) {
  await db.query(
    "UPDATE complaints SET assigned_executive_id = $1, status = 'assigned' WHERE id = $2",
    [executiveId, id]
  );
}

async function addHistory({ complaintId, actorUserId, fromStatus, toStatus, remarks }) {
  await db.query(
    `INSERT INTO complaint_history (complaint_id, actor_user_id, from_status, to_status, remarks)
     VALUES ($1,$2,$3,$4,$5)`,
    [complaintId, actorUserId, fromStatus, toStatus, remarks || null]
  );
}

async function getHistory(complaintId) {
  const { rows } = await db.query(
    `SELECT h.*, u.name AS actor_name
     FROM complaint_history h JOIN users u ON u.id = h.actor_user_id
     WHERE h.complaint_id = $1 ORDER BY h.created_at ASC`,
    [complaintId]
  );
  return rows;
}

async function addImage(complaintId, filePath, uploadedByRole) {
  await db.query(
    'INSERT INTO complaint_images (complaint_id, file_path, uploaded_by_role) VALUES ($1,$2,$3)',
    [complaintId, filePath, uploadedByRole]
  );
}

module.exports = {
  countToday, create, findById, list, updateStatus, assignExecutive,
  addHistory, getHistory, addImage
};
