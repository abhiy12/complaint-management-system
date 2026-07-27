// Placeholder for complaint-related socket events beyond the REST-triggered
// notifications already emitted from complaint.service.js (assign, status
// change). Extend here for things like typing indicators on remarks, or
// executive "en route" pings tied to a specific complaint.
module.exports = function complaintHandler(io, socket) {
  socket.on('complaint:watch', ({ complaintId }) => {
    socket.join(`complaint:${complaintId}`);
  });

  socket.on('complaint:unwatch', ({ complaintId }) => {
    socket.leave(`complaint:${complaintId}`);
  });
};
