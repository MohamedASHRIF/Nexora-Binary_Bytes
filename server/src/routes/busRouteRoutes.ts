import express from 'express';
import { protect } from '../middleware/auth';
import {
  createBusRoute,
  getBusRoutes,
  getBusRoute,
  updateBusRoute,
  deleteBusRoute
} from '../controllers/busRouteController';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getBusRoutes)
  .post(createBusRoute);

router.route('/:id')
  .get(getBusRoute)
  .patch(updateBusRoute)
  .delete(deleteBusRoute);

export default router; 