const bcrypt = require('bcrypt');
const executiveRepo = require('../repositories/executive.repository');
const auditLogRepo = require('../repositories/auditLog.repository');
const db = require('../config/db');
const { HttpError } = require('./auth.service');

async function listExecutives(query) {
  return executiveRepo.list(query);
}

async function getExecutive(id) {
  const exec = await executiveRepo.findById(id);
  if (!exec) throw new HttpError('Executive not found', 404);
  return exec;
}

async function createExecutive(payload, actor) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const roleResult = await client.query("SELECT id FROM roles WHERE name = 'executive' LIMIT 1");
    const roleId = roleResult.rows[0].id;

    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role_id) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [payload.name, payload.email, payload.phone, passwordHash, roleId]
    );
    const newUserId = userResult.rows[0].id;

    const execResult = await client.query(
      `INSERT INTO executives (user_id, employee_id, address, department, zone, skills, vehicle_number, experience_years)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [newUserId, payload.employeeId, payload.address, payload.department,
       payload.zone, payload.skills, payload.vehicleNumber, payload.experienceYears || 0]
    );

    await client.query('COMMIT');
    await auditLogRepo.log({ userId: actor.id, module: 'executives', action: 'create', newValue: { email: payload.email } });
    // tempPassword would be emailed to the executive in production via mailer.sendMail
    return { executiveId: execResult.rows[0].id, tempPassword };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') throw new HttpError('Executive with this email or employee ID already exists', 409);
    throw err;
  } finally {
    client.release();
  }
}

// Central rule: an executive on approved leave can never be assigned work.
// This is checked here (service layer) AND in sp_assign_complaint (DB layer)
// as defense-in-depth against any code path that bypasses the service.
async function assertAvailableForAssignment(executiveId) {
  const exec = await executiveRepo.findById(executiveId);
  if (!exec) throw new HttpError('Executive not found', 404);
  if (exec.is_on_leave) throw new HttpError('Cannot assign: executive is currently on leave', 409);
  return exec;
}

async function updateLocation(executiveId, latitude, longitude) {
  await executiveRepo.updateLocation(executiveId, latitude, longitude);
}

async function applyLeave(executiveId, { leaveFrom, leaveTo, leaveType, reason }) {
  await db.query(
    `INSERT INTO leave_requests (executive_id, leave_from, leave_to, leave_type, reason)
     VALUES ($1,$2,$3,$4,$5)`,
    [executiveId, leaveFrom, leaveTo, leaveType, reason]
  );
}

async function approveLeave(leaveId, approve, approverId) {
  const status = approve ? 'approved' : 'rejected';
  const { rows } = await db.query('SELECT * FROM leave_requests WHERE id = $1', [leaveId]);
  const leave = rows[0];
  if (!leave) throw new HttpError('Leave request not found', 404);

  await db.query(
    'UPDATE leave_requests SET approval_status = $1, approved_by = $2 WHERE id = $3',
    [status, approverId, leaveId]
  );
  if (approve) {
    await executiveRepo.setLeaveStatus(leave.executive_id, true);
  }
}

module.exports = {
  listExecutives, getExecutive, createExecutive, assertAvailableForAssignment,
  updateLocation, applyLeave, approveLeave
};
