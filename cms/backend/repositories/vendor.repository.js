const db = require('../config/db');

async function list({ page = 1, limit = 20, status, search }) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];

  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    where.push(`(vendor_name ILIKE $${params.length - 2} OR company_name ILIKE $${params.length - 1} OR email ILIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT * FROM vendors ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), Number(offset)]
  );
  const { rows: countRows } = await db.query(`SELECT COUNT(*) AS total FROM vendors ${whereSql}`, params);

  return { rows, total: Number(countRows[0].total) };
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM vendors WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(v) {
  const vendorCode = `VEN-${Date.now()}`;
  const { rows } = await db.query(
    `INSERT INTO vendors (vendor_code, vendor_name, company_name, gst_number, address, city,
       state, country, pin_code, email, phone, contact_person)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [vendorCode, v.vendorName, v.companyName, v.gstNumber, v.address, v.city,
     v.state, v.country, v.pinCode, v.email, v.phone, v.contactPerson]
  );
  return rows[0].id;
}

async function update(id, v) {
  const fields = [];
  const params = [];
  const map = {
    vendorName: 'vendor_name', companyName: 'company_name', gstNumber: 'gst_number',
    address: 'address', city: 'city', state: 'state', country: 'country',
    pinCode: 'pin_code', email: 'email', phone: 'phone', contactPerson: 'contact_person',
    status: 'status'
  };
  Object.entries(v).forEach(([k, val]) => {
    if (map[k] !== undefined && val !== undefined) {
      params.push(val);
      fields.push(`${map[k]} = $${params.length}`);
    }
  });
  if (!fields.length) return;
  params.push(id);
  await db.query(`UPDATE vendors SET ${fields.join(', ')} WHERE id = $${params.length}`, params);
}

async function remove(id) {
  await db.query('DELETE FROM vendors WHERE id = $1', [id]);
}

module.exports = { list, findById, create, update, remove };
