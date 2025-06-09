import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Schedule } from '../models/Schedule';
import { BusRoute } from '../models/BusRoute';
import { Event } from '../models/Event';
import { catchAsync } from '../utils/catchAsync';

// Debug: Log environment variables
console.log('Environment variables:', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
  NODE_ENV: process.env.NODE_ENV
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are Nexora, a helpful campus assistant for NovaCore University. 
Your role is to assist students, staff, and visitors with campus-related queries.
You can help with:
- Finding locations on campus
- Providing information about facilities
- Answering questions about university services
- Giving directions
- Sharing campus news and events
Always be polite, professional, and accurate in your responses.`;

export const chat = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;
  const lowerMessage = message.toLowerCase();

  // Check if the message is about class schedules
  if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
    try {
      const schedules = await Schedule.find().sort({ startTime: 1 });
      
      if (schedules.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: "I don't see any class schedules in the system yet. Please ask an admin to add some schedules."
          }
        });
      }

      // Group schedules by day
      const schedulesByDay = schedules.reduce((acc, schedule) => {
        if (!acc[schedule.day]) {
          acc[schedule.day] = [];
        }
        acc[schedule.day].push(schedule);
        return acc;
      }, {} as Record<string, typeof schedules>);

      let formattedResponse = "Here's your class schedule:\n\n";
      
      Object.entries(schedulesByDay).forEach(([day, daySchedules]) => {
        formattedResponse += `${day}:\n`;
        daySchedules.forEach(schedule => {
          formattedResponse += `- ${schedule.startTime} to ${schedule.endTime}: ${schedule.className} (${schedule.location}) with ${schedule.instructor}\n`;
        });
        formattedResponse += "\n";
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: formattedResponse.trim()
        }
      });
    } catch (error) {
      logger.error('Error fetching schedules:', error);
      return next(new AppError('Failed to fetch schedules', 500));
    }
  }

  // Check if the message is about bus routes
  if (lowerMessage.includes('bus') || lowerMessage.includes('transport')) {
    try {
      const busRoutes = await BusRoute.find().sort({ route: 1 });
      
      if (busRoutes.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: "I don't see any bus routes in the system yet. Please ask an admin to add some routes."
          }
        });
      }

      let formattedResponse = "Here are the available bus routes:\n\n";
      
      busRoutes.forEach(route => {
        formattedResponse += `${route.route}:\n`;
        formattedResponse += `Duration: ${route.duration}\n`;
        formattedResponse += "Schedule:\n";
        route.schedule.forEach(time => {
          formattedResponse += `- ${time}\n`;
        });
        formattedResponse += "\n";
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: formattedResponse.trim()
        }
      });
    } catch (error) {
      logger.error('Error fetching bus routes:', error);
      return next(new AppError('Failed to fetch bus routes', 500));
    }
  }

  // Check if the message is about events
  if (lowerMessage.includes('event') || lowerMessage.includes('upcoming')) {
    try {
      const events = await Event.find().sort({ date: 1 });
      
      if (events.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: "I don't see any upcoming events in the system yet. Please ask an admin to add some events."
          }
        });
      }

      let formattedResponse = "Here are the upcoming events:\n\n";
      
      events.forEach(event => {
        formattedResponse += `${event.title}\n`;
        formattedResponse += `Date: ${event.date.toLocaleDateString()}\n`;
        formattedResponse += `Time: ${event.time}\n`;
        formattedResponse += `Location: ${event.location}\n`;
        formattedResponse += `Description: ${event.description}\n\n`;
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: formattedResponse.trim()
        }
      });
    } catch (error) {
      logger.error('Error fetching events:', error);
      return next(new AppError('Failed to fetch events', 500));
    }
  }

  // For other messages, use OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful campus assistant. Provide concise and accurate information about the campus, classes, and facilities."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: completion.choices[0].message?.content
      }
    });
  } catch (error) {
    logger.error('OpenAI API error:', error);
    return next(new AppError('Failed to get response from AI', 500));
  }
});

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(200).json({
        status: 'success',
        data: {
          messages: []
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        messages: chat.messages
      }
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    next(error);
  }
};

export const clearChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    await Chat.findOneAndUpdate(
      { userId },
      { $set: { messages: [] } },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Chat history cleared'
    });
  } catch (error) {
    logger.error('Clear chat error:', error);
    next(error);
  }
}; 