import express from 'express';
import { protect } from '../middleware/auth';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .get(getEvent)
  .patch(updateEvent)
  .delete(deleteEvent);

export default router; 