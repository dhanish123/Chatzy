import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getUserState,
  setSelectedConversation,
  setSelectedGroup,
  clearUserState
} from '../controllers/userStateController.js';

const router = express.Router();

// Get user state
router.get('/', authMiddleware, getUserState);

// Set selected conversation
router.post('/conversation', authMiddleware, setSelectedConversation);

// Set selected group
router.post('/group', authMiddleware, setSelectedGroup);

// Clear user state
router.post('/clear', authMiddleware, clearUserState);

export default router;
