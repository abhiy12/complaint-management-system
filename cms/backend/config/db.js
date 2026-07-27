const { Pool, types } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

// pg returns DATE and TIMESTAMP columns as JS Date objects by default, which
// silently shifts by timezone when serialized. mysql2 (used previously)
// returned them as plain strings via dateStrings:true, and every repository/
// frontend model assumes that shape — these type parsers preserve it exactly
// instead of touching dozens of call sites.
types.setTypeParser(1082, (val) => val); // DATE
types.setTypeParser(1114, (val) => val); // TIMESTAMP WITHOUT TIME ZONE

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_CONNECTION_LIMIT,
  ssl: { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED }
});

pool.connect()
  .then((client) => {
    logger.info('PostgreSQL pool connected');
    client.release();
  })
  .catch((err) => {
    logger.error(`PostgreSQL connection failed: ${err.message}`);
  });

pool.on('error', (err) => {
  // Fires for errors on idle clients in the pool (e.g. the DB provider
  // closing an idle connection) — log it, don't crash the process.
  logger.error(`Unexpected PostgreSQL pool error: ${err.message}`);
});

module.exports = pool;
