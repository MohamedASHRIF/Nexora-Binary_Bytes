import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  instructor: {
    type: String,
    required: [true, 'Instructor is required'],
    trim: true
  }
}, {
  timestamps: true
});

export const Schedule = mongoose.model('Schedule', scheduleSchema); 