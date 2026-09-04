import express from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.post('/:notificationId/read', authMiddleware, markNotificationAsRead);

export default router;
