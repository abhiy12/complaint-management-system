const complaintRepo = require('../repositories/complaint.repository');
const executiveService = require('./executive.service');
const notificationService = require('./notification.service');
const auditLogRepo = require('../repositories/auditLog.repository');
const { buildComplaintNumber } = require('../utils/complaintNumberGenerator');
const { HttpError } = require('./auth.service');

// Legal status transitions. Enforced here so an invalid transition never
// reaches the database, and so the rules live in exactly one place.
const TRANSITIONS = {
  open: ['assigned', 'cancelled'],
  assigned: ['accepted', 'rejected', 'cancelled'],
  accepted: ['reached_site', 'cancelled'],
  rejected: ['assigned', 'cancelled'], // re-assign after rejection
  reached_site: ['started', 'cancelled'],
  started: ['in_progress', 'cancelled'],
  in_progress: ['waiting_for_parts', 'completed', 'cancelled'],
  waiting_for_parts: ['in_progress', 'cancelled'],
  completed: ['closed', 'in_progress'], // admin can reopen if verification fails
  closed: [],
  cancelled: []
};

async function createComplaint(payload, actor) {
  const sequence = (await complaintRepo.countToday()) + 1;
  const complaintNumber = buildComplaintNumber(sequence);

  const id = await complaintRepo.create({
    complaintNumber,
    vendorId: actor.vendorId,
    vendorUserId: actor.vendorUserId,
    ...payload
  });

  await complaintRepo.addHistory({
    complaintId: id, actorUserId: actor.id, fromStatus: null, toStatus: 'open',
    remarks: 'Complaint created'
  });

  return complaintRepo.findById(id);
}

async function listComplaints(query) {
  return complaintRepo.list(query);
}

async function getComplaint(id) {
  const complaint = await complaintRepo.findById(id);
  if (!complaint) throw new HttpError('Complaint not found', 404);
  const history = await complaintRepo.getHistory(id);
  return { ...complaint, history };
}

async function assignComplaint({ complaintId, executiveId }, actor, io) {
  const complaint = await complaintRepo.findById(complaintId);
  if (!complaint) throw new HttpError('Complaint not found', 404);
  if (!['open', 'rejected'].includes(complaint.status)) {
    throw new HttpError(`Cannot assign a complaint in '${complaint.status}' status`, 409);
  }

  await executiveService.assertAvailableForAssignment(executiveId);

  await complaintRepo.assignExecutive(complaintId, executiveId);
  await complaintRepo.addHistory({
    complaintId, actorUserId: actor.id, fromStatus: complaint.status, toStatus: 'assigned',
    remarks: 'Assigned to executive'
  });
  await auditLogRepo.log({ userId: actor.id, module: 'complaints', action: 'assign',
    oldValue: { status: complaint.status }, newValue: { executiveId } });

  await notificationService.notifyComplaintAssigned(complaintId, executiveId, io);

  return complaintRepo.findById(complaintId);
}

async function updateStatus({ complaintId, status, remarks }, actor, io) {
  const complaint = await complaintRepo.findById(complaintId);
  if (!complaint) throw new HttpError('Complaint not found', 404);

  const allowed = TRANSITIONS[complaint.status] || [];
  if (!allowed.includes(status)) {
    throw new HttpError(
      `Invalid transition: '${complaint.status}' -> '${status}'. Allowed: ${allowed.join(', ') || 'none'}`,
      409
    );
  }

  await complaintRepo.updateStatus(complaintId, status);
  await complaintRepo.addHistory({
    complaintId, actorUserId: actor.id, fromStatus: complaint.status, toStatus: status, remarks
  });
  await auditLogRepo.log({ userId: actor.id, module: 'complaints', action: 'status_change',
    oldValue: { status: complaint.status }, newValue: { status } });

  await notificationService.notifyStatusChange(complaintId, status, io);

  return complaintRepo.findById(complaintId);
}

async function attachImage(complaintId, filePath, uploadedByRole) {
  await complaintRepo.addImage(complaintId, filePath, uploadedByRole);
}

module.exports = {
  createComplaint, listComplaints, getComplaint, assignComplaint, updateStatus, attachImage, TRANSITIONS
};
