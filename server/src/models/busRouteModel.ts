import mongoose, { Document } from 'mongoose';

interface IBusRoute extends Document {
  route: string;
  time: string;
  destination: string;
  description: string;
  stops: string[];
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

const busRouteSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stops: [{
    type: String
  }],
  duration: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
busRouteSchema.index({ route: 1 });
busRouteSchema.index({ time: 1 });

// Check if the model exists before creating a new one
export const BusRoute = mongoose.models.BusRoute || mongoose.model<IBusRoute>('BusRoute', busRouteSchema); 