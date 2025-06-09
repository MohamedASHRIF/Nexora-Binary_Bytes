import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  description: string;
  position: {
    lat: number;
    lng: number;
  };
  type: 'building' | 'facility' | 'landmark';
  category: string;
  openingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Location description is required'],
    trim: true
  },
  position: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  },
  type: {
    type: String,
    enum: ['building', 'facility', 'landmark'],
    required: [true, 'Location type is required']
  },
  category: {
    type: String,
    required: [true, 'Location category is required'],
    trim: true
  },
  openingHours: {
    type: Map,
    of: {
      open: String,
      close: String
    }
  },
  contact: {
    phone: String,
    email: String
  },
  amenities: [String]
}, {
  timestamps: true
});

// Index for geospatial queries
locationSchema.index({ position: '2dsphere' });

export const Location = mongoose.model<ILocation>('Location', locationSchema); 