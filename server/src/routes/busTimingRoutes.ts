import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllBusTimings,
  createBusTiming,
  updateBusTiming,
  deleteBusTiming
} from '../controllers/busTimingController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Restrict to admin
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllBusTimings)
  .post(createBusTiming);

router
  .route('/:id')
  .patch(updateBusTiming)
  .delete(deleteBusTiming);

export default router; 