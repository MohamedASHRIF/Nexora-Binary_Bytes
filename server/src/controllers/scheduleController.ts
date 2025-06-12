import { Request, Response, NextFunction } from 'express';
import { Schedule } from '../models/Schedule';
import { AppError } from '../middleware/errorMiddleware';
import { catchAsync } from '../utils/catchAsync';
import mongoose from 'mongoose';
import { User } from '../models/User';

interface PopulatedClass {
  name: string;
  location: string;
  instructor?: string;
}

interface PopulatedSchedule {
  time: string;
  class: PopulatedClass;
}

interface ClassDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  location: string;
  instructor: {
    name: string;
  };
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    degree?: string;
  };
}

// Get all schedules (admin) or user's schedules (student)
export const getSchedules = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Getting schedules for user:', req.user);
    
    // If user is admin, return all schedules
    if (req.user?.role === 'admin') {
      const schedules = await Schedule.find();
      return res.status(200).json({
        status: 'success',
        data: {
          schedules
        }
      });
    }

    // For students, return only their degree's schedules
    if (!req.user?.degree) {
      return next(new AppError('User degree not found', 400));
    }

    const schedules = await Schedule.find({ degree: req.user.degree });
    console.log('Found schedules:', schedules);

    res.status(200).json({
      status: 'success',
      data: {
        schedules
      }
    });
  } catch (error) {
    console.error('Error in getSchedules:', error);
    return next(new AppError('Error fetching schedules', 500));
  }
});

// Get today's schedule for the logged-in user
export const getTodaySchedule = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.degree) {
      return next(new AppError('User degree not found', 400));
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    const schedules = await Schedule.find({
      degree: req.user.degree,
      day: today,
      startTime: { $gte: currentTime }
    }).sort({ startTime: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        schedules
      }
    });
  } catch (error) {
    console.error('Error in getTodaySchedule:', error);
    return next(new AppError('Error fetching today\'s schedule', 500));
  }
});

// Create a new schedule (admin only)
export const createSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { className, day, startTime, endTime, location, instructor, degree } = req.body;

    // Validate required fields
    if (!className || !day || !startTime || !endTime || !location || !instructor || !degree) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Validate degree
    if (!['IT', 'AI', 'Design'].includes(degree)) {
      return next(new AppError('Invalid degree', 400));
    }

    const schedule = await Schedule.create({
      className,
      day,
      startTime,
      endTime,
      location,
      instructor,
      degree
    });

    res.status(201).json({
      status: 'success',
      data: {
        schedule
      }
    });
  } catch (error) {
    console.error('Error in createSchedule:', error);
    return next(new AppError('Error creating schedule', 500));
  }
});

// Update a schedule (admin only)
export const updateSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { className, day, startTime, endTime, location, instructor, degree } = req.body;

    // Validate degree if provided
    if (degree && !['IT', 'AI', 'Design'].includes(degree)) {
      return next(new AppError('Invalid degree', 400));
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        className,
        day,
        startTime,
        endTime,
        location,
        instructor,
        degree
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!schedule) {
      return next(new AppError('No schedule found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        schedule
      }
    });
  } catch (error) {
    console.error('Error in updateSchedule:', error);
    return next(new AppError('Error updating schedule', 500));
  }
});

// Delete a schedule (admin only)
export const deleteSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return next(new AppError('No schedule found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    return next(new AppError('Error deleting schedule', 500));
  }
}); 