import { Request, Response, NextFunction } from 'express';
import { BusRoute } from '../models/busRouteModel';
import { AppError } from '../middleware/errorHandler';
import { catchAsync } from '../utils/catchAsync';
import mongoose from 'mongoose';

interface BusRouteDocument {
  _id: string;
  route: string;
  time: string;
  destination: string;
  description: string;
  stops: string[];
  duration: string;
}

// Get all bus routes
export const getBusRoutes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const routes = await BusRoute.find().sort({ time: 1 });
  
  // Format the response to match frontend expectations
  const formattedRoutes = routes.map((route: BusRouteDocument) => ({
    _id: route._id,
    route: route.route,
    time: route.time,
    destination: route.destination,
    description: route.description,
    stops: route.stops,
    duration: route.duration
  }));

  res.status(200).json({
    status: 'success',
    data: {
      data: formattedRoutes
    }
  });
});

// Get a single bus route
export const getBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const route = await BusRoute.findById(req.params.id);
  
  if (!route) {
    return next(new AppError('No bus route found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      route: {
        _id: route._id,
        name: route.route,
        time: route.time,
        destination: route.destination,
        description: route.description,
        stops: route.stops,
        duration: route.duration
      }
    }
  });
});

// Create a new bus route (admin only)
export const createBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newRoute = await BusRoute.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      route: {
        _id: newRoute._id,
        name: newRoute.route,
        time: newRoute.time,
        destination: newRoute.destination,
        description: newRoute.description,
        stops: newRoute.stops,
        duration: newRoute.duration
      }
    }
  });
});

// Update a bus route (admin only)
export const updateBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const route = await BusRoute.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!route) {
    return next(new AppError('No bus route found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      route: {
        _id: route._id,
        name: route.route,
        time: route.time,
        destination: route.destination,
        description: route.description,
        stops: route.stops,
        duration: route.duration
      }
    }
  });
});

// Delete a bus route (admin only)
export const deleteBusRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid bus route ID format', 400));
  }

  const route = await BusRoute.findByIdAndDelete(id);

  if (!route) {
    return next(new AppError('No bus route found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Bus route deleted successfully'
    }
  });
}); 