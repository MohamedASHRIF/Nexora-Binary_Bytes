import { Router } from 'express';
import { 
  createQuiz, 
  getQuizzes, 
  getQuizById, 
  updateQuiz, 
  deleteQuiz,
  debugQuizzes 
} from '../controllers/quizController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getQuizzes);
router.post('/', protect, createQuiz);
router.get('/debug', debugQuizzes); // Debug endpoint (no auth required)
router.get('/:id', getQuizById);
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

export default router; 