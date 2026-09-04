import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
let socket = null;

export const initializeSocket = (token) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId) => {
  if (socket) socket.emit('joinConversation', conversationId);
};

export const leaveConversation = (conversationId) => {
  if (socket) socket.emit('leaveConversation', conversationId);
};

export const sendTypingIndicator = (conversationId) => {
  if (socket) socket.emit('typing', { conversationId });
};

export const stopTypingIndicator = (conversationId) => {
  if (socket) socket.emit('stopTyping', { conversationId });
};

export const joinUserRoom = (userId) => {
  if (socket) socket.emit('joinUserRoom', userId);
};

export const joinGroup = (groupId) => {
  if (socket) socket.emit('joinGroup', groupId);
};

export const leaveGroup = (groupId) => {
  if (socket) socket.emit('leaveGroup', groupId);
};
