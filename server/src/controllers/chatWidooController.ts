import { Request, Response, NextFunction } from 'express';
import { ChatWidooMessage } from '../models/ChatWidooMessage';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

// Get all messages for the logged-in user
export const getMessages = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const messages = await ChatWidooMessage.find({ userId }).sort({ timestamp: 1 });
  res.status(200).json({ status: 'success', data: { messages } });
});

// Add a new message
export const addMessage = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { text, sentiment, score } = req.body;
  const message = await ChatWidooMessage.create({ userId, text, sentiment, score, timestamp: new Date() });
  res.status(201).json({ status: 'success', data: { message } });
});

// Edit a message
export const editMessage = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { text, sentiment, score } = req.body;
  const message = await ChatWidooMessage.findOneAndUpdate(
    { _id: id, userId },
    { text, sentiment, score, timestamp: new Date() },
    { new: true }
  );
  if (!message) return next(new AppError('Message not found', 404));
  res.status(200).json({ status: 'success', data: { message } });
});

// Delete a message
export const deleteMessage = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { id } = req.params;
  const message = await ChatWidooMessage.findOneAndDelete({ _id: id, userId });
  if (!message) return next(new AppError('Message not found', 404));
  res.status(204).json({ status: 'success', data: null });
}); 