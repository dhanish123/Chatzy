import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import blockRoutes from './routes/blockRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userStateRoutes from './routes/userStateRoutes.js';
import { User } from './models/User.js';
import { Message } from './models/Message.js';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.MOBILE_URL,
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Placeholder for old uploads to prevent 404 errors
app.use('/uploads', (req, res) => {
  res.status(410).json({ 
    message: 'Legacy upload endpoint. Images are now stored as base64 in database.' 
  });
});

// Admin route to cleanup old image URLs (cleanup migration)
app.post('/api/admin/cleanup-images', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fix user profile images
    const usersResult = await User.updateMany(
      { profileImage: { $regex: '^/uploads/' } },
      { $set: { profileImage: null } }
    );

    // Fix message media URLs
    const messagesResult = await Message.updateMany(
      { mediaUrl: { $regex: '^/uploads/' } },
      { $set: { mediaUrl: null } }
    );

    res.json({
      message: 'Cleanup complete',
      usersUpdated: usersResult.modifiedCount,
      messagesUpdated: messagesResult.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Cleanup failed', error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user-state', userStateRoutes);

app.use(errorHandler);

export default app;
