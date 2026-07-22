import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createSession,
  getSessions,
  getSession,
  deleteSession,
  sendMessage,
} from '../controllers/chatController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.delete('/:id', deleteSession);
router.post('/:id/messages', sendMessage);

export default router;
