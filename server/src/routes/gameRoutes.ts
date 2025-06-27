import { Router } from 'express';
import { getGameScore, updateGameScore } from '../controllers/gameController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/score', protect, getGameScore);
router.post('/score', protect, updateGameScore);

export default router; 