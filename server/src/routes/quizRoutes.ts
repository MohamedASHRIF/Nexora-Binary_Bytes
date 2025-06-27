import { Router } from 'express';
import { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz } from '../controllers/quizController';
import { protect } from '../middleware/auth';

const router = Router();

// Public: get all quizzes, get by id
router.get('/', getQuizzes);
router.get('/:id', getQuizById);

// Protected: create, update, delete
router.post('/', protect, createQuiz);
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

export default router; 