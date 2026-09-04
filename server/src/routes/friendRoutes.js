import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getPendingRequests,
  getSentRequests,
  getFriends
} from '../controllers/friendController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/requests', authMiddleware, sendFriendRequest);
router.post('/requests/:requestId/accept', authMiddleware, acceptFriendRequest);
router.post('/requests/:requestId/reject', authMiddleware, rejectFriendRequest);
router.delete('/requests/:requestId', authMiddleware, cancelFriendRequest);
router.get('/requests/pending', authMiddleware, getPendingRequests);
router.get('/requests/sent', authMiddleware, getSentRequests);
router.get('/', authMiddleware, getFriends);

export default router;
