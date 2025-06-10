import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
  degree: 'IT' | 'AI' | 'Design';
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>({
  className: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: [true, 'Please specify the day']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  instructor: {
    type: String,
    required: [true, 'Please add an instructor']
  },
  degree: {
    type: String,
    enum: ['IT', 'AI', 'Design'],
    required: [true, 'Please specify the degree']
  }
}, {
  timestamps: true
});

export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema); 