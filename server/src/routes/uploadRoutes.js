import express from 'express';
import { uploadImage, uploadVideo, uploadAudio, uploadFileGeneric } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.post('/image', authMiddleware, upload.single('file'), uploadImage);
router.post('/video', authMiddleware, upload.single('file'), uploadVideo);
router.post('/audio', authMiddleware, upload.single('file'), uploadAudio);
router.post('/file', authMiddleware, upload.single('file'), uploadFileGeneric);

export default router;
