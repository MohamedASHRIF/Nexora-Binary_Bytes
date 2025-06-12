import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const signToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '90d' });
};

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role, degree } = req.body;

  console.log('Signup request:', { name, email, role, degree });

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'Email already in use'
    });
  }

  // Create new user
  const userData = {
    name,
    email,
    password,
    role: role || 'student',
    degree: degree || undefined
  };

  console.log('Creating user with data:', userData);

  const user = await User.create(userData);

  console.log('User created:', { id: user._id, role: user.role, degree: user.degree });

  // Generate token
  const token = signToken(String(user._id));

  // Remove password from output
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    degree: user.degree
  };

  console.log('User response:', userResponse);

  res.status(201).json({
    status: 'success',
    token,
    user: userResponse
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  console.log('User found during login:', { id: user._id, role: user.role, degree: user.degree });

  // Generate token
  const token = signToken(String(user._id));

  // Remove password from output
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    degree: user.degree
  };

  console.log('Login response:', userResponse);

  res.status(200).json({
    status: 'success',
    token,
    user: userResponse
  });
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  
  // Check if user exists
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if current password is correct
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = signToken(String(user._id));

  res.status(200).json({
    status: 'success',
    token
  });
}); 