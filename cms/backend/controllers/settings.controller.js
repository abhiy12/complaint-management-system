const settingsService = require('../services/settings.service');
const { success } = require('../utils/apiResponse');

async function list(req, res, next) {
  try { return success(res, await settingsService.listSettings()); }
  catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    const { key, value } = req.body;
    return success(res, await settingsService.updateSetting(key, value, req.user), 'Setting updated');
  } catch (err) { return next(err); }
}

module.exports = { list, update };
