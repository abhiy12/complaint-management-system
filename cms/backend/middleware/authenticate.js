const { verifyAccessToken } = require('../utils/jwt');
const { failure } = require('../utils/apiResponse');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return failure(res, 'Missing or malformed access token', 401);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { id, roleId, roleName, vendorId, executiveId }
    return next();
  } catch (err) {
    return failure(res, 'Invalid or expired access token', 401);
  }
}

module.exports = authenticate;
