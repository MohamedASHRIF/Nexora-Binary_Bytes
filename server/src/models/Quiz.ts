import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  faculty: 'IT' | 'AI' | 'Design';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
});

const quizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String },
  questions: { type: [quizQuestionSchema], required: true },
  faculty: { 
    type: String, 
    enum: ['IT', 'AI', 'Design'], 
    required: true 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema); 