export const handleGroupEvents = (io, socket) => {
  socket.on('joinGroup', (groupId) => {
    socket.join(`group:${groupId}`);
    socket.to(`group:${groupId}`).emit('userJoinedGroup', { userId: socket.userId });
  });

  socket.on('leaveGroup', (groupId) => {
    socket.to(`group:${groupId}`).emit('userLeftGroup', { userId: socket.userId });
    socket.leave(`group:${groupId}`);
  });

  socket.on('groupNewMessage', (data) => {
    const { groupId, message } = data;
    socket.to(`group:${groupId}`).emit('groupNewMessage', message);
  });

  socket.on('groupMessageDelivered', (data) => {
    const { groupId, messageId } = data;
    socket.to(`group:${groupId}`).emit('groupMessageDelivered', { messageId });
  });

  socket.on('groupMessageRead', (data) => {
    const { groupId, messageId } = data;
    socket.to(`group:${groupId}`).emit('groupMessageRead', { messageId, userId: socket.userId });
  });

  socket.on('groupMessageUpdated', (data) => {
    const { groupId, messageId, content } = data;
    socket.to(`group:${groupId}`).emit('groupMessageUpdated', { messageId, content });
  });

  socket.on('groupMessageDeleted', (data) => {
    const { groupId, messageId } = data;
    socket.to(`group:${groupId}`).emit('groupMessageDeleted', { messageId });
  });

  socket.on('groupTyping', (data) => {
    const { groupId } = data;
    socket.to(`group:${groupId}`).emit('userTypingGroup', { userId: socket.userId });
  });

  socket.on('groupStopTyping', (data) => {
    const { groupId } = data;
    socket.to(`group:${groupId}`).emit('userStoppedTypingGroup', { userId: socket.userId });
  });

  socket.on('groupRecording', (data) => {
    const { groupId } = data;
    socket.to(`group:${groupId}`).emit('userRecordingGroup', { userId: socket.userId });
  });

  socket.on('groupStopRecording', (data) => {
    const { groupId } = data;
    socket.to(`group:${groupId}`).emit('userStoppedRecordingGroup', { userId: socket.userId });
  });

  socket.on('memberAdded', (data) => {
    const { groupId, newMemberId } = data;
    io.to(`group:${groupId}`).emit('groupMemberAdded', { newMemberId });
  });

  socket.on('userLeftGroup', (data) => {
    const { groupId, userId } = data;
    io.to(`group:${groupId}`).emit('userLeftGroupNotification', { userId });
  });
};
