const settingsRepo = require('../repositories/settings.repository');
const auditLogRepo = require('../repositories/auditLog.repository');

async function listSettings() {
  const rows = await settingsRepo.getAll();
  // Return as a flat map too, since the frontend mostly wants { key: value }
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return { rows, map };
}

async function updateSetting(key, value, actor) {
  const before = await settingsRepo.getByKey(key);
  await settingsRepo.upsert(key, String(value));
  await auditLogRepo.log({
    userId: actor.id, module: 'settings', action: 'update',
    oldValue: before, newValue: { key, value }
  });
  return settingsRepo.getByKey(key);
}

module.exports = { listSettings, updateSetting };
