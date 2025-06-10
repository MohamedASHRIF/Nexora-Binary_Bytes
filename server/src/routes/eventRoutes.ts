import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  createEvent,
  getEvents,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Public route for chatbot
router.get('/chat', getEvents);

// Admin routes
router.use(restrictTo('admin'));

router.route('/')
  .get(getAllEvents)
  .post(createEvent);

router.route('/:id')
  .get(getEvent)
  .patch(updateEvent)
  .delete(deleteEvent);

export default router; 