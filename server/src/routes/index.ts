import express from 'express';
import authRoutes from './authRoutes';
import chatRoutes from './chatRoutes';
import locationRoutes from './locationRoutes';
import scheduleRoutes from './scheduleRoutes';
import eventRoutes from './eventRoutes';
import busRouteRoutes from './busRouteRoutes';
import userRoutes from './userRoutes';
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

export default router; 