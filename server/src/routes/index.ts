import express from 'express';
import authRoutes from './authRoutes';
import chatRoutes from './chatRoutes';
import locationRoutes from './locationRoutes';
import scheduleRoutes from './scheduleRoutes';
import eventRoutes from './eventRoutes';
import busRouteRoutes from './busRouteRoutes';
import userRoutes from './userRoutes';
import chatWidooRoutes from './chatWidooRoutes';
import cafeteriaRoutes from './cafeteriaRoutes';
import quizRoutes from './quizRoutes';
import gameRoutes from './gameRoutes';
import forumRoutes from './forumRoutes';
import { logger } from '../utils/logger';

const router = express.Router();

// Log all incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/locations', locationRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/events', eventRoutes);
router.use('/bus-routes', busRouteRoutes);
router.use('/users', userRoutes);
router.use('/chatwidoo', chatWidooRoutes);
router.use('/cafeteria', cafeteriaRoutes);
router.use('/quiz', quizRoutes);
router.use('/game', gameRoutes);
router.use('/forum', forumRoutes);

export default router; 