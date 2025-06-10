import { Request, Response, NextFunction } from 'express';
import { Schedule } from '../models/scheduleModel';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import mongoose from 'mongoose';

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

// Get all schedules (admin only)
export const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
  const schedules = await Schedule.find()
    .sort({ day: 1, startTime: 1 })
    .lean();
  
  res.status(200).json({
    status: 'success',
    data: {
      data: schedules
    }
  });
});

// Get current user's schedule (for chatbot)
export const getMySchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching schedules...');
    
    // Get current day and time
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

    // For chatbot, return schedules for the current day and after the current time
    const schedules = await Schedule.find({
      day: currentDay,
      startTime: { $gte: currentTime }
    })
      .sort({ startTime: 1 })
      .lean()
      .exec();

    console.log('Found schedules:', schedules);

    // Format the schedule data directly from the schedule documents
    const formattedSchedule = schedules.map(item => {
      console.log('Processing schedule item:', item);
      
      return {
        className: item.className || '',
        day: item.day || '',
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        location: item.location || '',
        instructor: item.instructor || 'TBA'
      };
    });

    console.log('Formatted schedule:', formattedSchedule);

    res.status(200).json({
      status: 'success',
      data: {
        data: formattedSchedule
      }
    });
  } catch (error) {
    console.error('Error in getMySchedule:', error);
    next(new AppError('Failed to fetch schedules', 500));
  }
});

// Create a new schedule (admin only)
export const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const schedule = await Schedule.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: schedule
    }
  });
});

// Update a schedule (admin only)
export const updateSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: schedule
    }
  });
});

// Delete a schedule (admin only)
export const deleteSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
}); 