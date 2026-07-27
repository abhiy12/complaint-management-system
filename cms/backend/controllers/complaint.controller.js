const complaintService = require('../services/complaint.service');
const { success } = require('../utils/apiResponse');
const QRCode = require('qrcode');

async function list(req, res, next) {
  try { return success(res, await complaintService.listComplaints(req.query)); }
  catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try { return success(res, await complaintService.getComplaint(req.params.id)); }
  catch (err) { return next(err); }
}

async function create(req, res, next) {
  try { return success(res, await complaintService.createComplaint(req.body, req.user), 'Complaint created', 201); }
  catch (err) { return next(err); }
}

async function assign(req, res, next) {
  try {
    const io = req.app.get('io');
    return success(res, await complaintService.assignComplaint(req.body, req.user, io), 'Complaint assigned');
  } catch (err) { return next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const io = req.app.get('io');
    return success(res, await complaintService.updateStatus(req.body, req.user, io), 'Status updated');
  } catch (err) { return next(err); }
}

async function upload(req, res, next) {
  try {
    if (!req.file) return success(res, null, 'No file provided', 400);
    await complaintService.attachImage(req.params.id, req.file.path, req.user.roleName);
    return success(res, { filePath: req.file.filename }, 'File uploaded');
  } catch (err) { return next(err); }
}

async function history(req, res, next) {
  try {
    const complaintRepo = require('../repositories/complaint.repository');
    return success(res, await complaintRepo.getHistory(req.params.id));
  } catch (err) { return next(err); }
}

async function qrCode(req, res, next) {
  try {
    const complaint = await complaintService.getComplaint(req.params.id);
    const dataUrl = await QRCode.toDataURL(complaint.complaint_number, { margin: 1, width: 240 });
    return success(res, { complaintNumber: complaint.complaint_number, qrCodeDataUrl: dataUrl });
  } catch (err) { return next(err); }
}

module.exports = { list, getOne, create, assign, updateStatus, upload, history, qrCode };
