import express from 'express';
import {
  createGroup,
  getGroups,
  getGroup,
  addGroupMembers,
  leaveGroup,
  clearGroup
} from '../controllers/groupController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getGroups);
router.get('/:groupId', authMiddleware, getGroup);
router.post('/:groupId/members', authMiddleware, addGroupMembers);
router.delete('/:groupId/leave', authMiddleware, leaveGroup);
router.delete('/:groupId/clear', authMiddleware, clearGroup);

export default router;
