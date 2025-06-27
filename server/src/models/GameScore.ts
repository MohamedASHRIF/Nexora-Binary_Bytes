import mongoose, { Document, Schema } from 'mongoose';

export interface IGameScore extends Document {
  user: mongoose.Types.ObjectId;
  xWins: number;
  oWins: number;
  draws: number;
}

const gameScoreSchema = new Schema<IGameScore>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  xWins: { type: Number, default: 0 },
  oWins: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
}, {
  timestamps: true
});

export const GameScore = mongoose.model<IGameScore>('GameScore', gameScoreSchema); 