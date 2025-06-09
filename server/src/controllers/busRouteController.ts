import { Request, Response, NextFunction } from 'express';
import { BusRoute } from '../models/BusRoute';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import { logger } from '../utils/logger';

export const createBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const busRoute = await BusRoute.create(req.body);
  res.status(201).json({
    status: 'success',
    data: busRoute
  });
});

export const getBusRoutes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const busRoutes = await BusRoute.find().sort({ route: 1 });
  res.status(200).json({
    status: 'success',
    data: busRoutes
  });
});

export const getBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const busRoute = await BusRoute.findById(req.params.id);
  if (!busRoute) {
    return next(new AppError('No bus route found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: busRoute
  });
});

export const updateBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const busRoute = await BusRoute.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!busRoute) {
    return next(new AppError('No bus route found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: busRoute
  });
});

export const deleteBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const busRoute = await BusRoute.findByIdAndDelete(req.params.id);
  if (!busRoute) {
    return next(new AppError('No bus route found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
}); 