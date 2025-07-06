import express from 'express';
import { Question } from '../models/Question';
import { protect } from '../middleware/auth';
import { AppError } from '../middleware/errorMiddleware';

const router = express.Router();

// Get all questions with filtering and sorting
router.get('/', async (req, res, next) => {
  try {
    const { faculty, sort = 'newest', search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter: any = {};
    if (faculty && faculty !== 'all') {
      filter.faculty = faculty;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'mostVoted':
        sortObj = { voteCount: -1 };
        break;
      case 'mostAnswered':
        sortObj = { answerCount: -1 };
        break;
      case 'mostViewed':
        sortObj = { views: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const questions = await Question.find(filter)
      .populate('author', 'name email faculty')
      .populate('answers.author', 'name email faculty')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + questions.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Get single question by ID
router.get('/:id', async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name email faculty')
      .populate('answers.author', 'name email faculty')
      .populate('upvotes.user', 'name')
      .populate('downvotes.user', 'name');

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Create new question
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, content, faculty, tags } = req.body;

    if (!title || !content) {
      return next(new AppError('Title and content are required', 400));
    }

    const question = new Question({
      title,
      content,
      author: req.user.id,
      faculty: faculty || req.user.faculty || 'General',
      tags: tags || []
    });

    await question.save();
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'name email faculty');

    res.status(201).json(populatedQuestion);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Update question
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { title, content, faculty, tags } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    // Check if user is the author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.faculty = faculty || question.faculty;
    question.tags = tags || question.tags;
    question.updatedAt = new Date();

    await question.save();
    
    const updatedQuestion = await Question.findById(question._id)
      .populate('author', 'name email faculty')
      .populate('answers.author', 'name email faculty');

    res.json(updatedQuestion);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Delete question
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    // Check if user is the author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Add answer to question
router.post('/:id/answers', protect, async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return next(new AppError('Answer content is required', 400));
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    const answer = {
      content,
      author: req.user.id,
      upvotes: [],
      downvotes: [],
      isBestAnswer: false,
      createdAt: new Date()
    };

    question.answers.push(answer);
    await question.save();

    const updatedQuestion = await Question.findById(req.params.id)
      .populate('author', 'name email faculty')
      .populate('answers.author', 'name email faculty');

    res.json(updatedQuestion);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Update answer
router.put('/:questionId/answers/:answerId', protect, async (req, res, next) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    const answer = question.answers.find((a) => a._id.toString() === req.params.answerId);
    if (!answer) {
      return next(new AppError('Answer not found', 404));
    }

    // Check if user is the answer author or admin
    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    answer.content = content;
    await question.save();

    const updatedQuestion = await Question.findById(req.params.questionId)
      .populate('author', 'name email faculty')
      .populate('answers.author', 'name email faculty');

    res.json(updatedQuestion);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Delete answer
router.delete('/:questionId/answers/:answerId', protect, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    const answer = question.answers.find((a) => a._id.toString() === req.params.answerId);
    if (!answer) {
      return next(new AppError('Answer not found', 404));
    }

    // Check if user is the answer author, question author, or admin
    if (answer.author.toString() !== req.user.id && 
        question.author.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    // Remove the answer from the array
    question.answers = question.answers.filter((a) => a._id.toString() !== req.params.answerId);
    await question.save();

    const updatedQuestion = await Question.findById(req.params.questionId)
      .populate('author', 'name email faculty')
      .populate('answers.author', 'name email faculty');

    res.json(updatedQuestion);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Vote on question
router.post('/:id/vote', protect, async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    const userId = req.user.id;
    const upvoteIndex = question.upvotes.findIndex((v: any) => v.user.toString() === userId);
    const downvoteIndex = question.downvotes.findIndex((v: any) => v.user.toString() === userId);

    // Remove existing votes
    if (upvoteIndex > -1) question.upvotes.splice(upvoteIndex, 1);
    if (downvoteIndex > -1) question.downvotes.splice(downvoteIndex, 1);

    // Add new vote
    if (voteType === 'upvote') {
      question.upvotes.push({ user: userId, createdAt: new Date() });
    } else if (voteType === 'downvote') {
      question.downvotes.push({ user: userId, createdAt: new Date() });
    }

    await question.save();
    res.json(question);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Vote on answer
router.post('/:questionId/answers/:answerId/vote', protect, async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    const answer = question.answers.find((a) => a._id.toString() === req.params.answerId);
    if (!answer) {
      return next(new AppError('Answer not found', 404));
    }

    const userId = req.user.id;
    const upvoteIndex = answer.upvotes.findIndex((v: any) => v.user.toString() === userId);
    const downvoteIndex = answer.downvotes.findIndex((v: any) => v.user.toString() === userId);

    // Remove existing votes
    if (upvoteIndex > -1) answer.upvotes.splice(upvoteIndex, 1);
    if (downvoteIndex > -1) answer.downvotes.splice(downvoteIndex, 1);

    // Add new vote
    if (voteType === 'upvote') {
      answer.upvotes.push({ user: userId, createdAt: new Date() });
    } else if (voteType === 'downvote') {
      answer.downvotes.push({ user: userId, createdAt: new Date() });
    }

    await question.save();
    res.json(question);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Mark answer as best answer
router.post('/:questionId/answers/:answerId/best', protect, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    // Check if user is the question author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const answer = question.answers.find((a) => a._id.toString() === req.params.answerId);
    if (!answer) {
      return next(new AppError('Answer not found', 404));
    }

    // Remove best answer from all other answers
    question.answers.forEach(ans => {
      ans.isBestAnswer = false;
    });

    // Mark this answer as best
    answer.isBestAnswer = true;
    question.isResolved = true;

    await question.save();

    const updatedQuestion = await Question.findById(req.params.questionId)
      .populate('author', 'name email faculty')
      .populate('answers.author', 'name email faculty');

    res.json(updatedQuestion);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

export default router; 