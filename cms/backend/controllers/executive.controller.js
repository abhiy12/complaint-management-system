const executiveService = require('../services/executive.service');
const { success } = require('../utils/apiResponse');

async function list(req, res, next) {
  try { return success(res, await executiveService.listExecutives(req.query)); }
  catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try { return success(res, await executiveService.getExecutive(req.params.id)); }
  catch (err) { return next(err); }
}

async function create(req, res, next) {
  try { return success(res, await executiveService.createExecutive(req.body, req.user), 'Executive created', 201); }
  catch (err) { return next(err); }
}

async function updateLocation(req, res, next) {
  try {
    // Executive updates their own location; executiveId resolved from JWT in production
    const executiveId = req.body.executiveId || req.user.executiveId;
    await executiveService.updateLocation(executiveId, req.body.latitude, req.body.longitude);
    const io = req.app.get('io');
    io.to('admins').emit('executive:location', { executiveId, latitude: req.body.latitude, longitude: req.body.longitude });
    return success(res, null, 'Location updated');
  } catch (err) { return next(err); }
}

async function applyLeave(req, res, next) {
  try {
    const executiveId = req.body.executiveId || req.user.executiveId;
    await executiveService.applyLeave(executiveId, req.body);
    return success(res, null, 'Leave request submitted', 201);
  } catch (err) { return next(err); }
}

async function approveLeave(req, res, next) {
  try {
    await executiveService.approveLeave(req.params.leaveId, req.body.approve, req.user.id);
    return success(res, null, 'Leave request updated');
  } catch (err) { return next(err); }
}

module.exports = { list, getOne, create, updateLocation, applyLeave, approveLeave };
