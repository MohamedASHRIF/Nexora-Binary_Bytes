import mongoose from 'mongoose';

export interface IEvent {
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  }
}, {
  timestamps: true
});

export const Event = mongoose.model<IEvent>('Event', eventSchema); 