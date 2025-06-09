import express from 'express';
import { chat, getChatHistory, clearChat } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/', chat);
router.get('/history', getChatHistory);
router.delete('/clear', clearChat);

export default router; 