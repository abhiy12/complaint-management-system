const { failure } = require('../utils/apiResponse');

// Usage: authorize('super_admin', 'vendor_admin')
// For finer-grained permission checks (role_permissions table), extend
// this to accept permission codes and look them up via a cached map.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return failure(res, 'Not authenticated', 401);
    if (!allowedRoles.includes(req.user.roleName)) {
      return failure(res, 'You do not have permission to perform this action', 403);
    }
    return next();
  };
}

module.exports = authorize;
