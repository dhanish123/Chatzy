import express from 'express';
import {
  getMessages,
  createMessage,
  editMessage,
  deleteMessage,
  markMessageAsRead
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/:conversationId', authMiddleware, getMessages);
router.post('/', authMiddleware, createMessage);
router.put('/:messageId', authMiddleware, editMessage);
router.delete('/:messageId', authMiddleware, deleteMessage);
router.post('/:messageId/read', authMiddleware, markMessageAsRead);

export default router;
