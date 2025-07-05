import { Request, Response, NextFunction } from 'express';
import { GameScore } from '../models/GameScore';
import AppError from '../utils/appError';
import mongoose from 'mongoose';

// GET /api/game/score - get current user's score
export const getGameScore = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('Looking for GameScore for user:', userId);
    let score = await GameScore.findOne({ user: userId });
    console.log('Found score:', score);
    if (!score) {
      score = await GameScore.create({ user: userId });
      console.log('Created new score:', score);
    }
    res.status(200).json({ status: 'success', data: score });
  } catch (err) {
    next(err);
  }
};

// POST /api/game/score - update current user's score
export const updateGameScore = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { xWins, oWins, draws } = req.body;
    console.log('Updating GameScore for user:', userId, 'with', { xWins, oWins, draws });
    let score = await GameScore.findOne({ user: userId });
    if (!score) {
      score = await GameScore.create({ user: userId, xWins, oWins, draws });
      console.log('Created new score:', score);
    } else {
      score.xWins = xWins;
      score.oWins = oWins;
      score.draws = draws;
      await score.save();
      console.log('Updated score:', score);
    }
    res.status(200).json({ status: 'success', data: score });
  } catch (err) {
    next(err);
  }
}; 