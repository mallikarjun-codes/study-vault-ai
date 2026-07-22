import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

// Ensure upload directory exists synchronously
if (!fs.existsSync(env.uploadTempDir)) {
  fs.mkdirSync(env.uploadTempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.uploadTempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedMimeTypes.includes(mime) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file format. Only PDF, TXT, and DOCX files are supported.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSize,
  },
  fileFilter,
});

export const uploadSingleFile = upload.single('file');

/**
 * Middleware wrapper to handle Multer upload errors gracefully and pass control to next handler.
 */
export function handleMulterUpload(req, res, next) {
  uploadSingleFile(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const sizeMb = (env.maxFileSize / (1024 * 1024)).toFixed(0);
          return res.status(400).json({
            error: `File size exceeds maximum allowed limit of ${sizeMb}MB.`,
          });
        }
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      }
      return res.status(err.statusCode || 400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}
