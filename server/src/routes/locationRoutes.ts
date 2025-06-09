import { Router } from 'express';
import {
  getAllLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  searchLocations,
  getNearbyLocations
} from '../controllers/locationController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllLocations);
router.get('/search', searchLocations);
router.get('/nearby', getNearbyLocations);
router.get('/:id', getLocation);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createLocation);
router.patch('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router; 