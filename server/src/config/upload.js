import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.random().toString(36).substring(7) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,      // 10MB
  video: 100 * 1024 * 1024,     // 100MB
  audio: 50 * 1024 * 1024,      // 50MB
  file: 50 * 1024 * 1024        // 50MB
};

// Get appropriate size limit based on content type
const getSizeLimit = (mimetype) => {
  if (mimetype.startsWith('image/')) return FILE_SIZE_LIMITS.image;
  if (mimetype.startsWith('video/')) return FILE_SIZE_LIMITS.video;
  if (mimetype.startsWith('audio/')) return FILE_SIZE_LIMITS.audio;
  return FILE_SIZE_LIMITS.file;
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // Max overall
});

// Create specific upload instances for each type with proper limits
export const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      if (file.size > FILE_SIZE_LIMITS.image) {
        cb(new Error(`Image size must be less than 10MB`));
      } else {
        cb(null, true);
      }
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: FILE_SIZE_LIMITS.image }
});

export const videoUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      if (file.size > FILE_SIZE_LIMITS.video) {
        cb(new Error(`Video size must be less than 100MB`));
      } else {
        cb(null, true);
      }
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
  limits: { fileSize: FILE_SIZE_LIMITS.video }
});

export const audioUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      if (file.size > FILE_SIZE_LIMITS.audio) {
        cb(new Error(`Audio size must be less than 50MB`));
      } else {
        cb(null, true);
      }
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: { fileSize: FILE_SIZE_LIMITS.audio }
});

export const fileUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.size > FILE_SIZE_LIMITS.file) {
      cb(new Error(`File size must be less than 50MB`));
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: FILE_SIZE_LIMITS.file }
});
