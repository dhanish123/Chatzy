import express from 'express';
import { getProfile, updateProfile, uploadProfileImage, getUser, searchUsers } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { imageUpload } from '../config/upload.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/profile-image', authMiddleware, imageUpload.single('image'), uploadProfileImage);
router.get('/search', authMiddleware, searchUsers);
router.get('/:userId', authMiddleware, getUser);

export default router;
