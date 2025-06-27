import { Request, Response, NextFunction } from 'express';
import { GameScore } from '../models/GameScore';
import AppError from '../utils/appError';

// GET /api/game/score - get current user's score
export const getGameScore = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    let score = await GameScore.findOne({ user: userId });
    if (!score) {
      score = await GameScore.create({ user: userId });
    }
    res.status(200).json({ status: 'success', data: score });
  } catch (err) {
    next(err);
  }
};

// POST /api/game/score - update current user's score
export const updateGameScore = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { xWins, oWins, draws } = req.body;
    let score = await GameScore.findOne({ user: userId });
    if (!score) {
      score = await GameScore.create({ user: userId, xWins, oWins, draws });
    } else {
      score.xWins = xWins;
      score.oWins = oWins;
      score.draws = draws;
      await score.save();
    }
    res.status(200).json({ status: 'success', data: score });
  } catch (err) {
    next(err);
  }
}; 