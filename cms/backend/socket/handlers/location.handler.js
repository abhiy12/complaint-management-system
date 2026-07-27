const executiveRepo = require('../../repositories/executive.repository');

// Executive apps emit 'executive:location:ping' every 30s (see settings.location_ping_interval_seconds)
module.exports = function locationHandler(io, socket) {
  socket.on('executive:location:ping', async ({ executiveId, latitude, longitude }) => {
    try {
      await executiveRepo.updateLocation(executiveId, latitude, longitude);
      io.to('admins').emit('executive:location', { executiveId, latitude, longitude, at: new Date().toISOString() });
    } catch (err) {
      socket.emit('error', { message: 'Failed to record location' });
    }
  });
};
