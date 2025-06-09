import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verify } from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const setupSocketServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.user?.email}`);

    // Join user's personal room
    socket.join(`user:${socket.user?._id}`);

    // Handle chat messages
    socket.on('send_message', async (data) => {
      try {
        // Broadcast message to all connected clients
        io.emit('new_message', {
          userId: socket.user?._id,
          message: data.message,
          timestamp: new Date()
        });

        // Log the message
        logger.info(`Message from ${socket.user?.email}: ${data.message}`);
      } catch (error) {
        logger.error('Error handling message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle typing status
    socket.on('typing', (isTyping) => {
      socket.broadcast.emit('user_typing', {
        userId: socket.user?._id,
        isTyping
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user?.email}`);
    });
  });

  return io;
}; 