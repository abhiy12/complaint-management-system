const bcrypt = require('bcrypt');
const vendorRepo = require('../repositories/vendor.repository');
const auditLogRepo = require('../repositories/auditLog.repository');
const db = require('../config/db');
const { HttpError } = require('./auth.service');

async function listVendors(query) {
  return vendorRepo.list(query);
}

async function getVendor(id) {
  const vendor = await vendorRepo.findById(id);
  if (!vendor) throw new HttpError('Vendor not found', 404);
  return vendor;
}

// Creates the vendor AND its one default vendor_admin login in a single
// transaction — matches the required flow where a vendor never exists
// without someone able to log in and use it.
async function createVendor(payload, actor) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const vendorCode = `VEN-${Date.now()}`;
    const vendorResult = await client.query(
      `INSERT INTO vendors (vendor_code, vendor_name, company_name, gst_number, address, city,
         state, country, pin_code, email, phone, contact_person)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [vendorCode, payload.vendorName, payload.companyName, payload.gstNumber, payload.address,
       payload.city, payload.state, payload.country, payload.pinCode, payload.email,
       payload.phone, payload.contactPerson]
    );
    const vendorId = vendorResult.rows[0].id;

    const roleResult = await client.query("SELECT id FROM roles WHERE name = 'vendor_admin' LIMIT 1");
    const roleId = roleResult.rows[0].id;

    // The default user logs in with the vendor's own email unless a distinct
    // one is supplied, and a temp password if none is provided — mirrors the
    // pattern already used for executives (createExecutive below).
    const defaultUserEmail = payload.defaultUserEmail || payload.email;
    const defaultUserPassword = payload.defaultUserPassword || Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(defaultUserPassword, 12);

    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role_id, vendor_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [payload.contactPerson || payload.vendorName, defaultUserEmail, payload.phone, passwordHash, roleId, vendorId]
    );
    const newUserId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO vendor_users (user_id, vendor_id, department, role) VALUES ($1,$2,$3,$4)`,
      [newUserId, vendorId, 'Administration', 'vendor_admin']
    );

    await client.query('COMMIT');
    await auditLogRepo.log({
      userId: actor.id, module: 'vendors', action: 'create',
      newValue: { vendorId, defaultUserEmail }
    });

    // tempPassword is only meaningful if one wasn't supplied — the frontend
    // shows it once so it can be handed to the vendor; wire in mailer.sendMail
    // here in production instead of displaying it.
    const vendor = await vendorRepo.findById(vendorId);
    return { vendor, defaultUser: { email: defaultUserEmail, tempPassword: payload.defaultUserPassword ? null : defaultUserPassword } };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') throw new HttpError('A vendor or user with this email already exists', 409); // unique_violation
    throw err;
  } finally {
    client.release();
  }
}

async function updateVendor(id, payload, actor) {
  const before = await vendorRepo.findById(id);
  if (!before) throw new HttpError('Vendor not found', 404);
  await vendorRepo.update(id, payload);
  await auditLogRepo.log({ userId: actor.id, module: 'vendors', action: 'update', oldValue: before, newValue: payload });
  return vendorRepo.findById(id);
}

async function deleteVendor(id, actor) {
  const before = await vendorRepo.findById(id);
  if (!before) throw new HttpError('Vendor not found', 404);
  await vendorRepo.remove(id);
  await auditLogRepo.log({ userId: actor.id, module: 'vendors', action: 'delete', oldValue: before });
}

// Creates the login user + vendor_users profile row in one transaction.
async function createVendorUser({ name, email, phone, password, vendorId, role, department }, actor) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const roleResult = await client.query('SELECT id FROM roles WHERE name = $1 LIMIT 1', [role]);
    const roleRow = roleResult.rows[0];
    if (!roleRow) throw new HttpError('Invalid role', 400);

    const passwordHash = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role_id, vendor_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, email, phone, passwordHash, roleRow.id, vendorId]
    );
    const newUserId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO vendor_users (user_id, vendor_id, department, role) VALUES ($1,$2,$3,$4)`,
      [newUserId, vendorId, department, role]
    );

    await client.query('COMMIT');
    await auditLogRepo.log({ userId: actor.id, module: 'vendor_users', action: 'create', newValue: { email, vendorId, role } });
    return newUserId;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') throw new HttpError('A user with this email already exists', 409);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listVendors, getVendor, createVendor, updateVendor, deleteVendor, createVendorUser };
