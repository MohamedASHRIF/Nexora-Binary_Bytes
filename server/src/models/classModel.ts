import mongoose, { Document } from 'mongoose';

interface IClass extends Document {
  name: string;
  location: string;
  instructor: mongoose.Types.ObjectId;
  capacity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
classSchema.index({ name: 1 });
classSchema.index({ instructor: 1 });

// Check if the model exists before creating a new one
export const Class = mongoose.models.Class || mongoose.model<IClass>('Class', classSchema); 