const notificationRepo = require('../repositories/notification.repository');
const complaintRepo = require('../repositories/complaint.repository');
const executiveRepo = require('../repositories/executive.repository');
const db = require('../config/db');

// Persist a notification row AND push it in real time if the target user
// has a live socket connection (handled by the socket layer's room join).
async function push({ userId, title, message, eventType, io }) {
  const id = await notificationRepo.create({ userId, title, message, eventType });
  if (io) {
    io.to(`user:${userId}`).emit('notification', { id, title, message, eventType });
  }
}

async function notifyComplaintAssigned(complaintId, executiveId, io) {
  const exec = await executiveRepo.findById(executiveId);
  const complaint = await complaintRepo.findById(complaintId);
  if (!exec) return;
  await push({
    userId: exec.user_id,
    title: 'New complaint assigned',
    message: `Complaint ${complaint.complaint_number}: ${complaint.subject}`,
    eventType: 'complaint_assigned',
    io
  });
}

async function notifyStatusChange(complaintId, status, io) {
  const complaint = await complaintRepo.findById(complaintId);
  // Notify the vendor user who raised it
  const { rows } = await db.query(
    `SELECT vu.user_id FROM vendor_users vu WHERE vu.id = $1`, [complaint.vendor_user_id]
  );
  const vu = rows[0];
  if (vu) {
    await push({
      userId: vu.user_id,
      title: 'Complaint status updated',
      message: `Complaint ${complaint.complaint_number} is now '${status}'`,
      eventType: 'complaint_status_changed',
      io
    });
  }
}

async function listForUser(userId, opts) {
  return notificationRepo.listForUser(userId, opts);
}

async function markRead(id, userId) {
  await notificationRepo.markRead(id, userId);
}

module.exports = { push, notifyComplaintAssigned, notifyStatusChange, listForUser, markRead };
