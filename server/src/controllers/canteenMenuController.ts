import { Request, Response, NextFunction } from 'express';
import { CanteenMenu } from '../models/CanteenMenu';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';

// Add a new canteen menu
export const addMenu = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { canteenName, meals, date } = req.body;
  const menu = await CanteenMenu.create({ canteenName, meals, date });
  res.status(201).json({ status: 'success', data: { menu } });
});

// Get all canteen menus
export const getMenus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const menus = await CanteenMenu.find().sort({ canteenName: 1 });
  res.status(200).json({ status: 'success', data: { menus } });
});

// Get menu by canteen name
export const getMenuByCanteen = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { canteenName } = req.params;
  const menu = await CanteenMenu.findOne({ canteenName });
  if (!menu) return next(new AppError('Menu not found', 404));
  res.status(200).json({ status: 'success', data: { menu } });
});

// Update a menu
export const updateMenu = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { canteenName, meals, date } = req.body;
  const menu = await CanteenMenu.findByIdAndUpdate(id, { canteenName, meals, date }, { new: true });
  if (!menu) return next(new AppError('Menu not found', 404));
  res.status(200).json({ status: 'success', data: { menu } });
});

// Delete a menu
export const deleteMenu = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const menu = await CanteenMenu.findByIdAndDelete(id);
  if (!menu) return next(new AppError('Menu not found', 404));
  res.status(204).json({ status: 'success', data: null });
}); 