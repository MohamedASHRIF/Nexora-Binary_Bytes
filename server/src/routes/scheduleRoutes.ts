import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllSchedules,
  getMySchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (for authenticated users)
router.get('/my-schedule', getMySchedule);

// Admin only routes
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllSchedules)
  .post(createSchedule);

router
  .route('/:id')
  .patch(updateSchedule)
  .delete(deleteSchedule);

export default router; 