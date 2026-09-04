export const handleGroupEvents = (io, socket) => {
  socket.on('joinGroup', (groupId) => {
    socket.join(`group:${groupId}`);
  });

  socket.on('leaveGroup', (groupId) => {
    socket.leave(`group:${groupId}`);
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
};
