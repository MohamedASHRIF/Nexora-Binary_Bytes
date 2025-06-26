import mongoose, { Document, Schema } from 'mongoose';

export interface ICanteenMenu extends Document {
  canteenName: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
  date?: Date;
}

const canteenMenuSchema = new Schema<ICanteenMenu>({
  canteenName: {
    type: String,
    required: true,
    trim: true
  },
  meals: {
    breakfast: [{ type: String, trim: true }],
    lunch: [{ type: String, trim: true }],
    dinner: [{ type: String, trim: true }],
  },
  date: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

export const CanteenMenu = mongoose.model<ICanteenMenu>('CanteenMenu', canteenMenuSchema); 