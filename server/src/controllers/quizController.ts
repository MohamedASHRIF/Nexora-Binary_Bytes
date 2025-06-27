import { Request, Response, NextFunction } from 'express';
import { Quiz } from '../models/Quiz';
import AppError from '../utils/appError';

// Create a new quiz
export const createQuiz = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { title, description, questions } = req.body;
    const quiz = await Quiz.create({
      title,
      description,
      questions,
      createdBy: req.user.id,
    });
    res.status(201).json({ status: 'success', data: quiz });
  } catch (err) {
    next(err);
  }
};

// Get all quizzes
export const getQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: quizzes });
  } catch (err) {
    next(err);
  }
};

// Get a single quiz by ID
export const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    res.status(200).json({ status: 'success', data: quiz });
  } catch (err) {
    next(err);
  }
};

// Update a quiz
export const updateQuiz = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { title, description, questions } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description, questions },
      { new: true, runValidators: true }
    );
    if (!quiz) return next(new AppError('Quiz not found', 404));
    res.status(200).json({ status: 'success', data: quiz });
  } catch (err) {
    next(err);
  }
};

// Delete a quiz
export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}; 