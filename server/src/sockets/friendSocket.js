export const handleFriendEvents = (io, socket) => {
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('leaveUserRoom', (userId) => {
    socket.leave(`user:${userId}`);
  });

  socket.on('friendRequestSent', (data) => {
    const { receiverId, request } = data;
    io.to(`user:${receiverId}`).emit('friendRequestReceived', request);
  });

  socket.on('friendRequestAccepted', (data) => {
    const { receiverId, request } = data;
    io.to(`user:${receiverId}`).emit('friendRequestAcceptedReceived', request);
  });

  socket.on('friendRequestRejected', (data) => {
    const { receiverId, requestId } = data;
    io.to(`user:${receiverId}`).emit('friendRequestRejectedReceived', { requestId });
  });

  socket.on('friendRequestCancelled', (data) => {
    const { receiverId, requestId } = data;
    io.to(`user:${receiverId}`).emit('friendRequestCancelledReceived', { requestId });
  });
};
