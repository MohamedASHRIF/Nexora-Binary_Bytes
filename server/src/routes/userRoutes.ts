import express from 'express';
import { register, getMe, getAllUsers, deleteUser } from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signup', register);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.get('/', restrictTo('admin'), getAllUsers);
router.delete('/:id', restrictTo('admin'), deleteUser);

export default router; 