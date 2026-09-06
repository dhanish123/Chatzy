import express from 'express';
import {
  createGroup,
  getGroups,
  getGroup,
  addGroupMembers,
  leaveGroup,
  clearGroup,
  makeAdmin,
  removeAdmin,
  removeMember,
  deleteGroup
} from '../controllers/groupController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getGroups);
router.get('/:groupId', authMiddleware, getGroup);
router.post('/:groupId/members', authMiddleware, addGroupMembers);
router.post('/:groupId/members/:memberId/admin', authMiddleware, makeAdmin);
router.delete('/:groupId/members/:memberId/admin', authMiddleware, removeAdmin);
router.delete('/:groupId/members/:memberId', authMiddleware, removeMember);
router.delete('/:groupId/leave', authMiddleware, leaveGroup);
router.delete('/:groupId/clear', authMiddleware, clearGroup);
router.delete('/:groupId', authMiddleware, deleteGroup);

export default router;
