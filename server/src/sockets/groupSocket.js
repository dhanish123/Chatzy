import { Message } from '../models/Message.js';

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

  socket.on('groupMessageDelivered', async (data) => {
    const { groupId, messageId } = data;
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: 'delivered' },
        { new: true }
      );
      io.to(`group:${groupId}`).emit('messageStatusUpdated', { messageId, status: 'delivered' });
    } catch (error) {
      console.error('Error updating group message status:', error);
    }
  });

  socket.on('groupMessageRead', async (data) => {
    const { groupId, messageId } = data;
    try {
      const message = await Message.findById(messageId);
      if (message) {
        const readBy = message.readBy.find(r => r.userId.toString() === socket.userId.toString());
        if (!readBy) {
          message.readBy.push({ userId: socket.userId, readAt: new Date() });
          message.status = 'read';
          await message.save();
        }
        io.to(`group:${groupId}`).emit('messageStatusUpdated', { messageId, status: 'read' });
      }
    } catch (error) {
      console.error('Error marking group message as read:', error);
    }
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
