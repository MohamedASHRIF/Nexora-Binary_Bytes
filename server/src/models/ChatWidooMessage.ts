import mongoose, { Document, Schema } from 'mongoose';

export interface IChatWidooMessage extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  sentiment: string;
  score: number;
  timestamp: Date;
}

const chatWidooMessageSchema = new Schema<IChatWidooMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const ChatWidooMessage = mongoose.model<IChatWidooMessage>('ChatWidooMessage', chatWidooMessageSchema); 