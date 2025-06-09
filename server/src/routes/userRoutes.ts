import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { getMe, getAllUsers } from '../controllers/userController';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Get current user profile
router.get('/me', getMe);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', getAllUsers);

export default router; 