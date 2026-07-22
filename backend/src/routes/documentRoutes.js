import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { handleMulterUpload } from '../middleware/uploadMiddleware.js';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from '../controllers/documentController.js';

const router = express.Router();

// Enforce authentication on all document routes
router.use(authMiddleware);

// POST /api/documents/upload
router.post('/upload', handleMulterUpload, uploadDocument);

// GET /api/documents
router.get('/', getDocuments);

// DELETE /api/documents/:id
router.delete('/:id', deleteDocument);

export default router;
