import express from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getConversation,
  markConversationAsRead,
  clearConversation,
  deleteConversation,
  archiveConversation,
  unarchiveConversation,
  muteConversation,
  pinConversation
} from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, getOrCreateConversation);
router.get('/', authMiddleware, getConversations);
router.put('/:conversationId/read', authMiddleware, markConversationAsRead);
router.delete('/:conversationId/clear', authMiddleware, clearConversation);
router.delete('/:conversationId', authMiddleware, deleteConversation);
router.post('/:conversationId/archive', authMiddleware, archiveConversation);
router.post('/:conversationId/unarchive', authMiddleware, unarchiveConversation);
router.put('/:conversationId/mute', authMiddleware, muteConversation);
router.put('/:conversationId/pin', authMiddleware, pinConversation);
router.get('/:conversationId', authMiddleware, getConversation);

export default router;
