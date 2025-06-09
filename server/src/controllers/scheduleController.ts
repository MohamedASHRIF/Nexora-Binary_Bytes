import { Request, Response, NextFunction } from 'express';
import { Schedule } from '../models/Schedule';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllSchedules = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const schedules = await Schedule.find();
  res.status(200).json({
    status: 'success',
    data: {
      schedules
    }
  });
});

export const createSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const schedule = await Schedule.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      schedule
    }
  });
});

export const getSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return next(new AppError('No schedule found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: schedule
    });
  } catch (error) {
    next(new AppError('Failed to fetch schedule', 400));
  }
};

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
      schedule
    }
  });
});

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