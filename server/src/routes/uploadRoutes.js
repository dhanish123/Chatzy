import express from 'express';
import { uploadImage, uploadVideo, uploadAudio, uploadFileGeneric } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/auth.js';
import { imageUpload, videoUpload, audioUpload, fileUpload } from '../config/upload.js';

const router = express.Router();

router.post('/image', authMiddleware, imageUpload.single('file'), uploadImage);
router.post('/video', authMiddleware, videoUpload.single('file'), uploadVideo);
router.post('/audio', authMiddleware, audioUpload.single('file'), uploadAudio);
router.post('/file', authMiddleware, fileUpload.single('file'), uploadFileGeneric);

export default router;
