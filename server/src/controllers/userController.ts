import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { catchAsync } from '../utils/catchAsync';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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