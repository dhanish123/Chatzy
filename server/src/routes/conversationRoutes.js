import express from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getConversation,
  markConversationAsRead,
  clearConversation
} from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, getOrCreateConversation);
router.get('/', authMiddleware, getConversations);
router.get('/:conversationId', authMiddleware, getConversation);
router.put('/:conversationId/read', authMiddleware, markConversationAsRead);
router.delete('/:conversationId/clear', authMiddleware, clearConversation);

export default router;
