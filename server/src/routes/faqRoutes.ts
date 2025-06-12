import express from 'express';
import {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  searchFAQs
} from '../controllers/faqController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllFAQs);
router.get('/search', searchFAQs);
router.get('/:id', getFAQById);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createFAQ);
router.patch('/:id', updateFAQ);
router.delete('/:id', deleteFAQ);

export default router; 