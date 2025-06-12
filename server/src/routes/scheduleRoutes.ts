import express from 'express';
import {
  getSchedules,
  getTodaySchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Student routes
router.get('/my-schedule', getSchedules);
router.get('/today', getTodaySchedule);

// Admin only routes
router.use(restrictTo('admin'));
router.route('/')
  .get(getSchedules)
  .post(createSchedule);

router.route('/:id')
  .patch(updateSchedule)
  .delete(deleteSchedule);

export default router; 