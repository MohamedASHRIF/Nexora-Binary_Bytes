import express from 'express';
import { register, getMe, getAllUsers, deleteUser, debugUser, updateUserDegree } from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.get('/debug/:email', debugUser);
router.patch('/degree/:email', updateUserDegree);

// Admin only routes
router.use(restrictTo('admin'));

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .delete(deleteUser);

export default router; 