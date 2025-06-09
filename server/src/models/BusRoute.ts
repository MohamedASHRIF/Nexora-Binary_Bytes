import mongoose from 'mongoose';

export interface IBusRoute {
  route: string;
  schedule: string[];
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

const busRouteSchema = new mongoose.Schema<IBusRoute>({
  route: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  schedule: [{
    type: String,
    required: [true, 'Schedule times are required']
  }],
  duration: {
    type: String,
    required: [true, 'Route duration is required'],
    trim: true
  }
}, {
  timestamps: true
});

export const BusRoute = mongoose.model<IBusRoute>('BusRoute', busRouteSchema); 