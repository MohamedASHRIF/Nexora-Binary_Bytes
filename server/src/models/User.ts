import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  points: number;
  badges: string[];
  language: 'en' | 'si' | 'ta';
  degree?: 'IT' | 'AI' | 'Design';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken: () => string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student'
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String
  }],
  language: {
    type: String,
    enum: ['en', 'si', 'ta'],
    default: 'en'
  },
  degree: {
    type: String,
    enum: ['IT', 'AI', 'Design'],
    required: function(this: IUser) {
      return this.role === 'student';
    },
    validate: {
      validator: function(this: IUser, value: string | undefined) {
        if (this.role === 'student') {
          return value !== undefined && ['IT', 'AI', 'Design'].includes(value);
        }
        return true;
      },
      message: 'Degree is required for students and must be one of: IT, AI, Design'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 