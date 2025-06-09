import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  sentiment?: number;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  text: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sentiment: {
    type: Number,
    min: -1,
    max: 1
  }
});

const chatSchema = new Schema<IChat>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 