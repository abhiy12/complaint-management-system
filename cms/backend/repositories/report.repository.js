const db = require('../config/db');

async function statusCounts() {
  const { rows } = await db.query('SELECT * FROM vw_complaint_status_counts');
  return rows;
}

async function vendorWise() {
  const { rows } = await db.query('SELECT * FROM vw_vendor_wise_complaints');
  return rows;
}

async function executivePerformance() {
  const { rows } = await db.query('SELECT * FROM vw_executive_performance');
  return rows;
}

async function categoryWise() {
  const { rows } = await db.query('SELECT * FROM vw_category_wise_complaints');
  return rows;
}

async function priorityWise() {
  const { rows } = await db.query('SELECT * FROM vw_priority_wise_complaints');
  return rows;
}

async function monthlyTrend() {
  const { rows } = await db.query('SELECT * FROM vw_monthly_complaint_trend');
  return rows;
}

async function dashboardCards() {
  const { rows } = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM vendors) AS total_vendors,
      (SELECT COUNT(*) FROM vendor_users) AS total_vendor_users,
      (SELECT COUNT(*) FROM executives) AS total_executives,
      (SELECT COUNT(*) FROM executives WHERE current_status = 'available' AND is_on_leave = FALSE) AS available_executives,
      (SELECT COUNT(*) FROM executives WHERE is_on_leave = TRUE) AS executives_on_leave,
      (SELECT COUNT(*) FROM complaints WHERE status = 'open') AS open_complaints,
      (SELECT COUNT(*) FROM complaints WHERE status = 'assigned') AS assigned_complaints,
      (SELECT COUNT(*) FROM complaints WHERE status = 'in_progress') AS in_progress_complaints,
      (SELECT COUNT(*) FROM complaints WHERE status = 'completed') AS completed_complaints,
      (SELECT COUNT(*) FROM complaints WHERE status = 'closed') AS closed_complaints,
      (SELECT COUNT(*) FROM complaints WHERE created_at::date = CURRENT_DATE) AS todays_complaints,
      (SELECT COUNT(*) FROM complaints WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE)) AS weekly_complaints,
      (SELECT COUNT(*) FROM complaints WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS monthly_complaints
  `);
  // Postgres returns COUNT(*) as a BIGINT, which node-postgres maps to a JS
  // string (to avoid silent precision loss above 2^53) — coerce every card
  // value to a number since the frontend's DashboardCards model expects numbers.
  const raw = rows[0];
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v)]));
}

module.exports = {
  statusCounts, vendorWise, executivePerformance, categoryWise,
  priorityWise, monthlyTrend, dashboardCards
};
