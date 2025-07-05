import { Request, Response, NextFunction } from 'express';
import { Quiz } from '../models/Quiz';
import { User } from '../models/User';
import AppError from '../utils/appError';

// Create a new quiz
export const createQuiz = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { title, description, questions, faculty } = req.body;
    const quiz = await Quiz.create({
      title,
      description,
      questions,
      faculty,
      createdBy: req.user.id,
    });
    res.status(201).json({ status: 'success', data: quiz });
  } catch (err) {
    next(err);
  }
};

// Get all quizzes (filtered by user's faculty if student)
export const getQuizzes = async (req: any, res: Response, next: NextFunction) => {
  try {
    let quizzes;
    
    console.log('=== QUIZ DEBUG START ===');
    console.log('getQuizzes called with user ID:', req.user?.id);
    console.log('req.user object:', JSON.stringify(req.user, null, 2));
    
    // If user is authenticated, filter by their faculty
    if (req.user) {
      const user = await User.findById(req.user.id);
      console.log('Found user in database:', { 
        id: user?._id, 
        degree: user?.degree, 
        role: user?.role,
        email: user?.email,
        name: user?.name
      });
      
      if (user && user.degree) {
        // Student: only show quizzes for their faculty
        console.log('✅ Filtering quizzes for student degree:', user.degree);
        quizzes = await Quiz.find({ faculty: user.degree }).sort({ createdAt: -1 });
        console.log('✅ Found quizzes for degree', user.degree, ':', quizzes.length);
        console.log('✅ Quiz details:', quizzes.map(q => ({ title: q.title, faculty: q.faculty })));
      } else {
        // Admin/Staff or user without degree: show all quizzes
        console.log('⚠️ Showing all quizzes - User role:', user?.role, 'User degree:', user?.degree);
        quizzes = await Quiz.find().sort({ createdAt: -1 });
        console.log('⚠️ Found all quizzes:', quizzes.length);
      }
    } else {
      // No user: show all quizzes
      console.log('❌ No user authenticated, showing all quizzes');
      quizzes = await Quiz.find().sort({ createdAt: -1 });
      console.log('❌ Found all quizzes:', quizzes.length);
    }
    
    console.log('=== FINAL RESULT ===');
    console.log('Returning quizzes:', quizzes.map(q => ({ title: q.title, faculty: q.faculty })));
    console.log('=== QUIZ DEBUG END ===');
    
    res.status(200).json({ status: 'success', data: quizzes });
  } catch (err) {
    console.error('❌ Error in getQuizzes:', err);
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
    const { title, description, questions, faculty } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description, questions, faculty },
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

// Debug endpoint to list all quizzes with faculty info
export const debugQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    console.log('=== DEBUG QUIZZES ===');
    console.log('Total quizzes in database:', quizzes.length);
    quizzes.forEach((quiz, index) => {
      console.log(`Quiz ${index + 1}:`, {
        id: quiz._id,
        title: quiz.title,
        faculty: quiz.faculty,
        questions: quiz.questions.length
      });
    });
    console.log('=== END DEBUG ===');
    
    res.status(200).json({ 
      status: 'success', 
      data: {
        total: quizzes.length,
        quizzes: quizzes.map(q => ({
          id: q._id,
          title: q.title,
          faculty: q.faculty,
          questions: q.questions.length
        }))
      }
    });
  } catch (err) {
    next(err);
  }
}; 