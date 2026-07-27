const notificationService = require('../services/notification.service');
const { success } = require('../utils/apiResponse');

async function list(req, res, next) {
  try { return success(res, await notificationService.listForUser(req.user.id, { unreadOnly: req.query.unread === 'true' })); }
  catch (err) { return next(err); }
}

async function markRead(req, res, next) {
  try { await notificationService.markRead(req.body.id, req.user.id); return success(res, null, 'Marked read'); }
  catch (err) { return next(err); }
}

module.exports = { list, markRead };
