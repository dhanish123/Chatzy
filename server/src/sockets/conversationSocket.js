import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

export const handleConversationEvents = (io, socket) => {
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('typing', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('userTyping', { userId: socket.userId });
  });

  socket.on('stopTyping', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('userStoppedTyping', { userId: socket.userId });
  });

  socket.on('recording', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('userRecording', { userId: socket.userId });
  });

  socket.on('stopRecording', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('userStoppedRecording', { userId: socket.userId });
  });

  socket.on('messageDelivered', async (data) => {
    const { messageId, conversationId } = data;
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: 'delivered' },
        { new: true }
      );
      io.to(`conversation:${conversationId}`).emit('messageStatusUpdated', {
        messageId,
        status: 'delivered'
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  });

  socket.on('messageRead', async (data) => {
    const { messageId, conversationId } = data;
    try {
      const message = await Message.findById(messageId);
      if (message) {
        const readBy = message.readBy.find(r => r.userId.toString() === socket.userId.toString());
        if (!readBy) {
          message.readBy.push({ userId: socket.userId, readAt: new Date() });
          message.status = 'read';
          await message.save();
        }
        io.to(`conversation:${conversationId}`).emit('messageStatusUpdated', {
          messageId,
          status: 'read'
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });
};
