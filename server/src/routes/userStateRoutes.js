import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getUserState,
  setSelectedConversation,
  setSelectedGroup,
  clearUserState
} from '../controllers/userStateController.js';

const router = express.Router();

// Get user state
router.get('/', auth, getUserState);

// Set selected conversation
router.post('/conversation', auth, setSelectedConversation);

// Set selected group
router.post('/group', auth, setSelectedGroup);

// Clear user state
router.post('/clear', auth, clearUserState);

export default router;
