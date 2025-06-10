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

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    degree?: string;
  };
}

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

export const chat = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    const lowerMessage = message.toLowerCase();
    logger.info('Received chat message:', { message, user: req.user });

    // Check if the message is about class schedules
    if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
      try {
        // Get user's degree from the request
        if (!req.user?.id) {
          return next(new AppError('User not authenticated', 401));
        }

        const user = await User.findById(req.user.id).select('+degree');
        if (!user) {
          return next(new AppError('User not found', 404));
        }

        logger.info('User info:', { userId: user._id, role: user.role, degree: user.degree });

        // If user is not a student, return a message
        if (user.role !== 'student') {
          return res.status(200).json({
            status: 'success',
            data: {
              message: "I can only show class schedules for students. Please contact the admin for more information."
            }
          });
        }

        // If user doesn't have a degree set
        if (!user.degree) {
          return res.status(200).json({
            status: 'success',
            data: {
              message: "Your degree information is not set. Please contact the admin to set your degree."
            }
          });
        }

        // Get schedules for the user's degree
        const schedules = await Schedule.find({ 
          degree: user.degree,
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        }).sort({ startTime: 1 });

        logger.info('Found schedules:', { 
          count: schedules.length, 
          degree: user.degree,
          schedules: schedules.map(s => ({ className: s.className, degree: s.degree }))
        });
        
        if (schedules.length === 0) {
          return res.status(200).json({
            status: 'success',
            data: {
              message: `I don't see any class schedules for ${user.degree} degree today.`
            }
          });
        }

        // Get current time
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

        // Filter schedules for future times
        const relevantSchedules = schedules.filter(schedule => 
          schedule.startTime >= currentTime
        );

        logger.info('Filtered schedules:', { 
          total: schedules.length, 
          relevant: relevantSchedules.length,
          schedules: relevantSchedules.map(s => ({ 
            className: s.className, 
            day: s.day, 
            startTime: s.startTime,
            degree: s.degree 
          }))
        });

        if (relevantSchedules.length === 0) {
          return res.status(200).json({
            status: 'success',
            data: {
              message: `You don't have any more ${user.degree} classes scheduled for today.`
            }
          });
        }

        let formattedResponse = `Here are your remaining ${user.degree} classes for today:\n\n`;
        
        relevantSchedules.forEach(schedule => {
          formattedResponse += `- ${schedule.startTime} to ${schedule.endTime}: ${schedule.className} (${schedule.location}) with ${schedule.instructor}\n`;
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
          formattedResponse += `Schedule: ${route.schedule}\n\n`;
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
      console.log('Attempting to use OpenAI for response...');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: message
          }
        ],
      });

      console.log('OpenAI response received:', {
        status: 'success',
        content: completion.choices[0].message?.content
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: completion.choices[0].message?.content
        }
      });
    } catch (error: any) {
      // Handle quota exceeded error
      if (error.status === 429 || error.code === 'insufficient_quota' || error.type === 'insufficient_quota') {
        console.log('Handling quota exceeded error with fallback response');
        // Provide a fallback response
        const fallbackResponse = getFallbackResponse(message);
        return res.status(200).json({
          status: 'success',
          data: {
            message: fallbackResponse
          }
        });
      }

      // Log other errors only once
      console.error('OpenAI API error:', error);
      logger.error('OpenAI API error:', error);

      // For other errors, return a generic error message
      return res.status(500).json({
        status: 'error',
        message: 'I apologize, but I am currently experiencing technical difficulties. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Error in chat controller:', error);
    return next(new AppError('An error occurred while processing your request', 500));
  }
});

// Helper function to generate fallback responses
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Handle greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your campus assistant. I can help you with class schedules, bus timings, cafeteria menus, and campus events. What would you like to know?";
  }

  // Handle introductions
  if (lowerMessage.includes('i am') || lowerMessage.includes('i\'m') || lowerMessage.includes('my name is')) {
    return "Nice to meet you! I'm your campus assistant. How can I help you today?";
  }

  // Handle questions about classes
  if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
    return "You can check your class schedule by asking 'What's my schedule?' or 'Show me my classes'. I'll help you find the right information.";
  }

  // Handle questions about buses
  if (lowerMessage.includes('bus') || lowerMessage.includes('transport')) {
    return "I can help you with bus schedules. Try asking 'When is the next bus?' or 'Show me bus routes' to get started.";
  }

  // Handle questions about food
  if (lowerMessage.includes('food') || lowerMessage.includes('menu') || lowerMessage.includes('cafeteria')) {
    return "You can check today's cafeteria menu by asking 'What's on the menu today?' or 'Show me the cafeteria menu'.";
  }

  // Handle questions about events
  if (lowerMessage.includes('event') || lowerMessage.includes('activity')) {
    return "I can show you upcoming campus events. Try asking 'What events are happening?' or 'Show me upcoming events'.";
  }

  // Default response
  return "I'm here to help! You can ask me about:\n" +
    "- Class schedules\n" +
    "- Bus routes and timings\n" +
    "- Cafeteria menus\n" +
    "- Campus events\n" +
    "- Location directions\n\n" +
    "What would you like to know?";
}

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