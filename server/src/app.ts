import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler, AppError } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import busRouteRoutes from './routes/busRouteRoutes';
import eventRoutes from './routes/eventRoutes';
import cafeteriaRoutes from './routes/cafeteriaRoutes';
import faqRoutes from './routes/faqRoutes';
import chatRoutes from './routes/chatRoutes';
import busTimingRoutes from './routes/busTimingRoutes';
import chatWidooRoutes from './routes/chatWidooRoutes';
import gameRoutes from './routes/gameRoutes';
import quizRoutes from './routes/quizRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bus', busRouteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/cafeteria', cafeteriaRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bus-timings', busTimingRoutes);
app.use('/api/chatwidoo', chatWidooRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/quiz', quizRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

export default app; 