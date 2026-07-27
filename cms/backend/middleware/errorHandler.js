const logger = require('../utils/logger');
const { failure } = require('../utils/apiResponse');

// Must be registered last, after all routes.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return failure(res, message, statusCode, err.errors || null);
}

function notFound(req, res) {
  return failure(res, `Route not found: ${req.originalUrl}`, 404);
}

module.exports = { errorHandler, notFound };
