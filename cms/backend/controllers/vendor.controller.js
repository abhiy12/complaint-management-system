const vendorService = require('../services/vendor.service');
const { success } = require('../utils/apiResponse');

async function list(req, res, next) {
  try { return success(res, await vendorService.listVendors(req.query)); }
  catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try { return success(res, await vendorService.getVendor(req.params.id)); }
  catch (err) { return next(err); }
}

async function create(req, res, next) {
  try { return success(res, await vendorService.createVendor(req.body, req.user), 'Vendor created', 201); }
  catch (err) { return next(err); }
}

async function update(req, res, next) {
  try { return success(res, await vendorService.updateVendor(req.params.id, req.body, req.user), 'Vendor updated'); }
  catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try { await vendorService.deleteVendor(req.params.id, req.user); return success(res, null, 'Vendor deleted'); }
  catch (err) { return next(err); }
}

async function createVendorUser(req, res, next) {
  try {
    const id = await vendorService.createVendorUser(req.body, req.user);
    return success(res, { id }, 'Vendor user created', 201);
  } catch (err) { return next(err); }
}

module.exports = { list, getOne, create, update, remove, createVendorUser };
