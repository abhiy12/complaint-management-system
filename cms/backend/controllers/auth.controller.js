const authService = require('../services/auth.service');
const { success, failure } = require('../utils/apiResponse');

async function login(req, res, next) {
  try {
    const result = await authService.login({ ...req.body, ip: req.ip });
    return success(res, result, 'Login successful');
  } catch (err) { return next(err); }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body);
    return success(res, result, 'Token refreshed');
  } catch (err) { return next(err); }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body);
    return success(res, null, 'Logged out');
  } catch (err) { return next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body);
    return success(res, null, 'If that email exists, a reset link has been sent');
  } catch (err) { return next(err); }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    return success(res, null, 'Password has been reset');
  } catch (err) { return next(err); }
}

async function profile(req, res, next) {
  try {
    const userRepo = require('../repositories/user.repository');
    const user = await userRepo.findById(req.user.id);
    if (!user) return failure(res, 'User not found', 404);
    const { password_hash, ...safe } = user;
    return success(res, safe);
  } catch (err) { return next(err); }
}

module.exports = { login, refresh, logout, forgotPassword, resetPassword, profile };
