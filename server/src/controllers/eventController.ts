import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const createEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const event = await Event.create(req.body);
  res.status(201).json({
    status: 'success',
    data: event
  });
});

export const getEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const events = await Event.find().sort({ date: 1 });
  
  // Format the response to match frontend expectations
  const formattedEvents = events.map(event => ({
    date: event.date,
    name: event.title,
    location: event.location,
    time: event.time
  }));

  res.status(200).json({
    status: 'success',
    data: {
      data: {
        upcoming: formattedEvents,
        categories: ['Academic', 'Social', 'Sports', 'Cultural'],
        registration: {
          required: [],
          link: ''
        }
      }
    }
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
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid event ID format', 400));
  }

  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Event deleted successfully'
    }
  });
});

export const getAllEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const events = await Event.find().sort({ date: 1 });
  
  res.status(200).json({
    status: 'success',
    data: {
      events
    }
  });
}); 