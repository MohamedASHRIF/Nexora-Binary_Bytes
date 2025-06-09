import { Request, Response, NextFunction } from 'express';
import { Location } from '../models/Location';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const getAllLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await Location.find();

    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: {
        locations
      }
    });
  } catch (error) {
    logger.error('Get all locations error:', error);
    next(error);
  }
};

export const getLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return next(new AppError('No location found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        location
      }
    });
  } catch (error) {
    logger.error('Get location error:', error);
    next(error);
  }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await Location.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        location
      }
    });
  } catch (error) {
    logger.error('Create location error:', error);
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!location) {
      return next(new AppError('No location found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        location
      }
    });
  } catch (error) {
    logger.error('Update location error:', error);
    next(error);
  }
};

export const deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return next(new AppError('No location found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Delete location error:', error);
    next(error);
  }
};

export const searchLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, type, category } = req.query;

    const filter: any = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    const locations = await Location.find(filter);

    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: {
        locations
      }
    });
  } catch (error) {
    logger.error('Search locations error:', error);
    next(error);
  }
};

export const getNearbyLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, maxDistance = 1000 } = req.query;

    if (!lat || !lng) {
      return next(new AppError('Please provide latitude and longitude', 400));
    }

    const locations = await Location.find({
      position: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
          },
          $maxDistance: parseInt(maxDistance as string)
        }
      }
    });

    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: {
        locations
      }
    });
  } catch (error) {
    logger.error('Get nearby locations error:', error);
    next(error);
  }
}; 