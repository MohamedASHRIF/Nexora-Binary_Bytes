import mongoose from 'mongoose';

export interface IBusRoute {
  route: string;
  schedule: string;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

const busRouteSchema = new mongoose.Schema({
  route: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  schedule: {
    type: String,
    required: [true, 'Schedule is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  }
}, {
  timestamps: true
});

export const BusRoute = mongoose.model('BusRoute', busRouteSchema); 