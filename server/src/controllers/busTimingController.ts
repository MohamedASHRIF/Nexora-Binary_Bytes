import { Request, Response, NextFunction } from 'express';
import { BusRoute } from '../models/BusRoute';
import { AppError } from '../middleware/errorHandler';
import { catchAsync } from '../utils/catchAsync';
import mongoose from 'mongoose';

// Get all bus timings
export const getAllBusTimings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const busTimings = await BusRoute.find().sort({ route: 1 });
  
  res.status(200).json({
    status: 'success',
    data: {
      busTimings
    }
  });
});

// Create a new bus timing
export const createBusTiming = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { route, schedule, duration } = req.body;

  // Validate required fields
  if (!route || !schedule || !duration) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const busTiming = await BusRoute.create({
    route,
    schedule,
    duration
  });

  res.status(201).json({
    status: 'success',
    data: {
      busTiming
    }
  });
});

// Update a bus timing
export const updateBusTiming = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { route, schedule, duration } = req.body;
  const { id } = req.params;

  const busTiming = await BusRoute.findByIdAndUpdate(
    id,
    { route, schedule, duration },
    { new: true, runValidators: true }
  );

  if (!busTiming) {
    return next(new AppError('No bus timing found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      busTiming
    }
  });
});

// Delete a bus timing
export const deleteBusTiming = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid bus timing ID format', 400));
  }

  const busTiming = await BusRoute.findByIdAndDelete(id);

  if (!busTiming) {
    return next(new AppError('No bus timing found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Bus timing deleted successfully'
    }
  });
}); 