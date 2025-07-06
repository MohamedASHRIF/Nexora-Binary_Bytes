import mongoose, { Document, Schema } from 'mongoose';

export interface IVote {
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IAnswer {
  _id?: any;
  content: string;
  author: mongoose.Types.ObjectId;
  upvotes: IVote[];
  downvotes: IVote[];
  isBestAnswer: boolean;
  createdAt: Date;
}

export interface IQuestion extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  faculty: 'IT' | 'AI' | 'Design' | 'General';
  tags: string[];
  upvotes: IVote[];
  downvotes: IVote[];
  answers: IAnswer[];
  views: number;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  voteCount: number;
  answerCount: number;
}

const voteSchema = new Schema<IVote>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const answerSchema = new Schema<IAnswer>({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [voteSchema],
  downvotes: [voteSchema],
  isBestAnswer: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const questionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  faculty: {
    type: String,
    enum: ['IT', 'AI', 'Design', 'General'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  upvotes: [voteSchema],
  downvotes: [voteSchema],
  answers: [answerSchema],
  views: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
questionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for vote count
questionSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual for answer count
questionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

// Ensure virtuals are serialized
questionSchema.set('toJSON', { virtuals: true });

export const Question = mongoose.model<IQuestion>('Question', questionSchema); 