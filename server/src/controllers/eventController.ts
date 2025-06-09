import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import { logger } from '../utils/logger';

export const createEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const event = await Event.create(req.body);
  res.status(201).json({
    status: 'success',
    data: event
  });
});

export const getEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const events = await Event.find().sort({ date: 1 });
  res.status(200).json({
    status: 'success',
    data: events
  });
});

export const getEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: event
  });
});

export const updateEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: event
  });
});

export const deleteEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
}); 