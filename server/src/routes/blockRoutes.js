import express from 'express';
import { blockUser, unblockUser, getBlockedUsers, isUserBlocked } from '../controllers/blockController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, blockUser);
router.delete('/:blockedId', authMiddleware, unblockUser);
router.get('/', authMiddleware, getBlockedUsers);
router.get('/:userId/check', authMiddleware, isUserBlocked);

export default router;
