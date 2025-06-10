import mongoose, { Document } from 'mongoose';

interface ISchedule extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  time: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  time: {
    type: String,
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better query performance
scheduleSchema.index({ student: 1, day: 1 });
scheduleSchema.index({ class: 1 });

// Check if the model exists before creating a new one
const Schedule = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', scheduleSchema);

// Configure Mongoose options
mongoose.set('strictPopulate', false);

export { Schedule }; 