import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { catchAsync } from '../utils/catchAsync';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Chat } from '../models/Chat';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role, degree } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }

  // Validate degree for students
  if (role === 'student' && !degree) {
    return next(new AppError('Degree is required for students', 400));
  }

  if (role === 'student' && !['IT', 'AI', 'Design'].includes(degree)) {
    return next(new AppError('Invalid degree selected', 400));
  }

  // Create user with role-specific data
  const userData = {
    name,
    email,
    password,
    role,
    ...(role === 'student' ? { degree } : { degree: undefined })
  };

  // Create user
  const user = await User.create(userData);

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );

  // Get user without password
  const userWithoutPassword = await User.findById(user._id).select('-password');

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: userWithoutPassword
    }
  });
});

export const getMe = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 401));
  }

  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent deleting the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(new AppError('Cannot delete the last admin user', 400));
    }
  }

  // Delete the user
  await User.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

// Debug endpoint to check user data
export const debugUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.params;
  
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        degree: user.degree,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// Update user degree (for fixing existing users)
export const updateUserDegree = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.params;
  const { degree } = req.body;

  // Validate degree
  if (!['IT', 'AI', 'Design'].includes(degree)) {
    return next(new AppError('Invalid degree. Must be IT, AI, or Design', 400));
  }

  const user = await User.findOneAndUpdate(
    { email, role: 'student' },
    { degree },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('Student not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        degree: user.degree
      }
    }
  });
});

// Get user-specific insights and analytics
export const getUserInsights = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const userId = req.user.id;
    const timeRange = req.query.timeRange as string || 'day';
    
    // Calculate time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // day
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get user's chat history
    const chat = await Chat.findOne({ userId });
    const messages = chat?.messages || [];

    // Filter messages by time range
    const filteredMessages = messages.filter(msg => 
      new Date(msg.timestamp) >= startDate
    );

    // Calculate insights
    const totalQueries = filteredMessages.filter(msg => msg.isUser).length;
    
    // Calculate queries by type
    const queriesByType = {
      schedule: filteredMessages.filter(msg => 
        msg.isUser && msg.text.toLowerCase().includes('schedule') || msg.text.toLowerCase().includes('class')
      ).length,
      bus: filteredMessages.filter(msg => 
        msg.isUser && msg.text.toLowerCase().includes('bus') || msg.text.toLowerCase().includes('transport')
      ).length,
      menu: filteredMessages.filter(msg => 
        msg.isUser && (msg.text.toLowerCase().includes('menu') || msg.text.toLowerCase().includes('food') || msg.text.toLowerCase().includes('cafeteria'))
      ).length,
      events: filteredMessages.filter(msg => 
        msg.isUser && msg.text.toLowerCase().includes('event')
      ).length,
      other: filteredMessages.filter(msg => 
        msg.isUser && 
        !msg.text.toLowerCase().includes('schedule') &&
        !msg.text.toLowerCase().includes('class') &&
        !msg.text.toLowerCase().includes('bus') &&
        !msg.text.toLowerCase().includes('transport') &&
        !msg.text.toLowerCase().includes('menu') &&
        !msg.text.toLowerCase().includes('food') &&
        !msg.text.toLowerCase().includes('cafeteria') &&
        !msg.text.toLowerCase().includes('event')
      ).length
    };

    // Calculate sentiment analysis
    const userMessages = filteredMessages.filter(msg => msg.isUser);
    const averageSentiment = userMessages.length > 0 
      ? userMessages.reduce((sum, msg) => sum + (msg.sentiment || 0), 0) / userMessages.length 
      : 0;

    // Calculate sentiment trend (last 7 messages)
    const sentimentTrend = userMessages.slice(-7).map(msg => msg.sentiment || 0);

    // Calculate peak hours
    const hourCounts = new Array(24).fill(0);
    userMessages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours();
      hourCounts[hour]++;
    });
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get popular queries
    const queryCounts: Record<string, number> = {};
    userMessages.forEach(msg => {
      const text = msg.text.toLowerCase().trim();
      if (text) {
        queryCounts[text] = (queryCounts[text] || 0) + 1;
      }
    });

    const popularQueries = Object.entries(queryCounts)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate hourly distribution for charts
    const hourly = hourCounts;

    res.status(200).json({
      status: 'success',
      data: {
        insights: {
          totalQueries,
          queriesByType,
          averageSentiment,
          sentimentTrend,
          peakHours,
          popularQueries,
          hourly
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user insights:', error);
    return next(new AppError('Error fetching user insights', 500));
  }
}); 