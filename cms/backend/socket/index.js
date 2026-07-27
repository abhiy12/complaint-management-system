const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const locationHandler = require('./handlers/location.handler');
const complaintHandler = require('./handlers/complaint.handler');

function initSocket(io) {
  // Auth handshake: client connects with { auth: { token } }
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token'));
      const payload = verifyAccessToken(token);
      socket.user = payload;
      return next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: user ${socket.user.id} (${socket.user.roleName})`);

    // Every user joins their personal room for direct notifications
    socket.join(`user:${socket.user.id}`);
    // Admins join a broadcast room used for live-tracking + new-complaint alerts
    if (socket.user.roleName === 'super_admin') socket.join('admins');
    if (socket.user.vendorId) socket.join(`vendor:${socket.user.vendorId}`);

    locationHandler(io, socket);
    complaintHandler(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.user.id}`);
    });
  });
}

module.exports = initSocket;
