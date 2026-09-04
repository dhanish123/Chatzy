import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

export const handleSocketConnection = async (socket) => {
  try {
    const user = await User.findById(socket.userId);
    if (user) {
      user.isOnline = true;
      await user.save();
    }

    socket.emit('connected', { userId: socket.userId });
    socket.broadcast.emit('userOnline', { userId: socket.userId });
  } catch (error) {
    console.error('Connection error:', error);
  }
};

export const handleSocketDisconnect = async (socket) => {
  try {
    const user = await User.findById(socket.userId);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();
    }

    socket.broadcast.emit('userOffline', { userId: socket.userId, lastSeen: user?.lastSeen });
  } catch (error) {
    console.error('Disconnect error:', error);
  }
};
