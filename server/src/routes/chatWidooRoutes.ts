import express from 'express';
import { getMessages, addMessage, editMessage, deleteMessage } from '../controllers/chatWidooController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/messages', getMessages);
router.post('/messages', addMessage);
router.put('/messages/:id', editMessage);
router.delete('/messages/:id', deleteMessage);

export default router; 