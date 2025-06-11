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

// Language translations
interface TranslationKeys {
  location_help: string;
  student_only: string;
  degree_not_set: string;
  no_schedules_today: string;
  no_more_classes: string;
  remaining_classes: string;
  no_bus_routes: string;
  available_routes: string;
  no_events: string;
  upcoming_events: string;
  error_fetching_schedule: string;
  error_fetching_bus: string;
  error_fetching_events: string;
  fallback_response: string;
}

const translations: Record<string, TranslationKeys> = {
  en: {
    location_help: "I can help you find locations on campus! Try asking for:\n\n• IT Faculty\n• Engineering Faculty\n• Architecture Faculty\n• Library\n• Cafeteria\n• Main Building\n\nJust ask 'Where is [location name]?' and I'll show you on the map!",
    student_only: "I can only show class schedules for students. Please contact the admin for more information.",
    degree_not_set: "Your degree information is not set. Please contact the admin to set your degree.",
    no_schedules_today: "I don't see any class schedules for {degree} degree today.",
    no_more_classes: "You don't have any more {degree} classes scheduled for today.",
    remaining_classes: "Here are your remaining {degree} classes for today:\n\n",
    no_bus_routes: "I don't see any bus routes in the system yet. Please ask an admin to add some routes.",
    available_routes: "Here are the available bus routes:\n\n",
    no_events: "I don't see any upcoming events in the system yet. Please ask an admin to add some events.",
    upcoming_events: "Here are the upcoming events:\n\n",
    error_fetching_schedule: "Sorry, I encountered an error while fetching your schedule. Please try again.",
    error_fetching_bus: "Sorry, I encountered an error while fetching bus routes. Please try again.",
    error_fetching_events: "Sorry, I encountered an error while fetching events. Please try again.",
    fallback_response: "I understand you're asking about something. I can help you with class schedules, bus routes, campus events, and finding locations. What would you like to know?"
  },
  si: {
    location_help: "මට විශ්වවිද්‍යාලයේ ස්ථාන සොයාගැනීමට උදව් කළ හැකිය! මෙය අසන්න:\n\n• IT පීඨය\n• ඉංජිනේරු පීඨය\n• ගෘහනිර්මාණ පීඨය\n• පුස්තකාලය\n• කෑමෝටුව\n• ප්‍රධාන ගොඩනැගිල්ල\n\n'[ස්ථාන නම] කොහෙද?' යනුවෙන් අසන්න, මම එය සිතියමේ පෙන්වන්නම්!",
    student_only: "මට ශිෂ්‍යයින් සඳහා පමණක් පන්ති කාලසටහන් පෙන්විය හැකිය. වැඩිදුර තොරතුරු සඳහා පරිපාලක අමතන්න.",
    degree_not_set: "ඔබේ උපාධි තොරතුරු සකස් කර නැත. ඔබේ උපාධිය සකස් කිරීමට පරිපාලක අමතන්න.",
    no_schedules_today: "අද {degree} උපාධිය සඳහා පන්ති කාලසටහන් නොපෙනේ.",
    no_more_classes: "අද ඔබට {degree} පන්ති වැඩිදුර නොමැත.",
    remaining_classes: "අද ඔබේ ඉතිරි {degree} පන්ති මෙන්න:\n\n",
    no_bus_routes: "තවම පද්ධතියේ බස් මාර්ග නොපෙනේ. කරුණාකර පරිපාලකෙකුගෙන් මාර්ග එකතු කිරීමට අසන්න.",
    available_routes: "ලබාගත හැකි බස් මාර්ග මෙන්න:\n\n",
    no_events: "තවම පද්ධතියේ ඉදිරි සිදුවීම් නොපෙනේ. කරුණාකර පරිපාලකෙකුගෙන් සිදුවීම් එකතු කිරීමට අසන්න.",
    upcoming_events: "ඉදිරි සිදුවීම් මෙන්න:\n\n",
    error_fetching_schedule: "සමාවෙන්න, ඔබේ කාලසටහන ලබාගැනීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    error_fetching_bus: "සමාවෙන්න, බස් මාර්ග ලබාගැනීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    error_fetching_events: "සමාවෙන්න, සිදුවීම් ලබාගැනීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    fallback_response: "ඔබ යමක් ගැන අසන බව මට තේරෙනවා. පන්ති කාලසටහන්, බස් මාර්ග, විශ්වවිද්‍යාල සිදුවීම් සහ ස්ථාන සොයාගැනීම ගැන මට උදව් කළ හැකිය. ඔබ දැනගැනීමට අවශ්‍ය දේ කුමක්ද?"
  },
  ta: {
    location_help: "வளாகத்தில் இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும்! இதைக் கேள்வி கேளுங்கள்:\n\n• IT பீடம்\n• பொறியியல் பீடம்\n• கட்டிடக்கலை பீடம்\n• நூலகம்\n• உணவகம்\n• முதன்மை கட்டிடம்\n\n'[இடத்தின் பெயர்] எங்கே?' என்று கேள்வி கேளுங்கள், நான் அதை வரைபடத்தில் காட்டுவேன்!",
    student_only: "மாணவர்களுக்கு மட்டுமே வகுப்பு அட்டவணைகளைக் காட்ட முடியும். மேலும் தகவலுக்கு நிர்வாகியை தொடர்பு கொள்ளவும்.",
    degree_not_set: "உங்கள் பட்டப்படிப்பு தகவல் அமைக்கப்படவில்லை. உங்கள் பட்டப்படிப்பை அமைக்க நிர்வாகியை தொடர்பு கொள்ளவும்.",
    no_schedules_today: "இன்று {degree} பட்டப்படிப்புக்கான வகுப்பு அட்டவணைகள் எதுவும் இல்லை.",
    no_more_classes: "இன்று உங்களுக்கு {degree} வகுப்புகள் எதுவும் இல்லை.",
    remaining_classes: "இன்று உங்கள் மீதமுள்ள {degree} வகுப்புகள் இதோ:\n\n",
    no_bus_routes: "சிஸ்டத்தில் பேருந்து வழித்தடங்கள் எதுவும் இல்லை. நிர்வாகியிடம் வழித்தடங்களை சேர்க்குமாறு கேள்வி கேளுங்கள்.",
    available_routes: "கிடைக்கக்கூடிய பேருந்து வழித்தடங்கள் இதோ:\n\n",
    no_events: "சிஸ்டத்தில் வரவிருக்கும் நிகழ்வுகள் எதுவும் இல்லை. நிர்வாகியிடம் நிகழ்வுகளை சேர்க்குமாறு கேள்வி கேளுங்கள்.",
    upcoming_events: "வரவிருக்கும் நிகழ்வுகள் இதோ:\n\n",
    error_fetching_schedule: "மன்னிக்கவும், உங்கள் அட்டவணையை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    error_fetching_bus: "மன்னிக்கவும், பேருந்து வழித்தடங்களை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    error_fetching_events: "மன்னிக்கவும், நிகழ்வுகளை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    fallback_response: "நீங்கள் ஏதாவது கேள்வி கேட்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். வகுப்பு அட்டவணைகள், பேருந்து வழித்தடங்கள், வளாக நிகழ்வுகள் மற்றும் இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும். நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?"
  }
};

// Helper function to get translation
const getTranslation = (key: keyof TranslationKeys, language: string, params?: Record<string, string>): string => {
  const lang = language as 'en' | 'si' | 'ta';
  const translation = translations[lang]?.[key] || translations.en[key] || String(key);
  
  if (params) {
    return Object.entries(params).reduce((text, [param, value]) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), value);
    }, translation);
  }
  
  return translation;
};

// Helper function to detect language from message
const detectLanguage = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for Sinhala characters (Unicode range: U+0D80 to U+0DFF)
  if (/[\u0D80-\u0DFF]/.test(message)) {
    return 'si';
  }
  
  // Check for Tamil characters (Unicode range: U+0B80 to U+0BFF)
  if (/[\u0B80-\u0BFF]/.test(message)) {
    return 'ta';
  }
  
  // Check for Tamil keywords in English script
  const tamilKeywords = ['vakuppu', 'class', 'schedule', 'bus', 'event', 'location', 'where', 'when', 'what'];
  if (tamilKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // If the message contains Tamil characters, prioritize Tamil
    if (/[\u0B80-\u0BFF]/.test(message)) {
      return 'ta';
    }
  }
  
  // Check for Sinhala keywords in English script
  const sinhalaKeywords = ['panti', 'kala', 'bas', 'kama', 'sithiyama', 'kohada'];
  if (sinhalaKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // If the message contains Sinhala characters, prioritize Sinhala
    if (/[\u0D80-\u0DFF]/.test(message)) {
      return 'si';
    }
  }
  
  return 'en';
};

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
    const { message, language: userLanguage } = req.body;
    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    // Detect language from message or use user preference
    const detectedLanguage = userLanguage || detectLanguage(message);
    const lowerMessage = message.toLowerCase();
    logger.info('Received chat message:', { message, user: req.user, language: detectedLanguage });

    let botResponse = '';

    // Check if the message is about locations/directions
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('directions') || 
        lowerMessage.includes('how to get to') || lowerMessage.includes('find') || lowerMessage.includes('map') ||
        lowerMessage.includes('எங்கே') || lowerMessage.includes('இடம்') || lowerMessage.includes('வழி') ||
        lowerMessage.includes('කොහෙද') || lowerMessage.includes('ස්ථානය') || lowerMessage.includes('මාර්ගය')) {
      
      console.log('Location detection triggered for message:', lowerMessage);
      
      // Define common campus locations
      const campusLocations = [
        { name: 'IT Faculty', keywords: ['it faculty', 'information technology', 'computer science', 'cs faculty', 'ஐடி பீடம்', 'கணினி அறிவியல்', 'IT පීඨය'] },
        { name: 'Engineering Faculty', keywords: ['engineering faculty', 'engineering', 'eng faculty', 'பொறியியல் பீடம்', 'பொறியியல்', 'ඉංජිනේරු පීඨය'] },
        { name: 'Architecture Faculty', keywords: ['architecture faculty', 'architecture', 'arch faculty', 'கட்டிடக்கலை பீடம்', 'கட்டிடக்கலை', 'ගෘහනිර්මාණ පීඨය'] },
        { name: 'Library', keywords: ['library', 'lib', 'study', 'books', 'நூலகம்', 'புத்தகங்கள்', 'පුස්තකාලය'] },
        { name: 'Cafeteria', keywords: ['cafeteria', 'canteen', 'food', 'lunch', 'dining', 'restaurant', 'உணவகம்', 'உணவு', 'காஃபி', 'කෑමෝටුව'] },
        { name: 'Main Building', keywords: ['main building', 'main', 'administration', 'admin', 'office', 'முதன்மை கட்டிடம்', 'நிர்வாகம்', 'ප්‍රධාන ගොඩනැගිල්ල'] }
      ];

      // Find matching location
      let foundLocation = null;
      for (const location of campusLocations) {
        console.log('Checking location:', location.name, 'with keywords:', location.keywords);
        if (location.keywords.some(keyword => lowerMessage.includes(keyword))) {
          foundLocation = location;
          console.log('Found matching location:', foundLocation.name);
          break;
        }
      }

      if (foundLocation) {
        const encodedLocation = encodeURIComponent(foundLocation.name);
        botResponse = `LOCATION_REDIRECT:${foundLocation.name}:${encodedLocation}`;
        console.log('Generated location redirect response:', botResponse);
      } else {
        console.log('No location found for message:', lowerMessage);
        botResponse = getTranslation('location_help', detectedLanguage);
      }
    }
    // Check if the message is about class schedules
    else if (lowerMessage.includes('class') || lowerMessage.includes('schedule') || 
             lowerMessage.includes('வகுப்பு') || lowerMessage.includes('அட்டவணை') || lowerMessage.includes('vakuppu') ||
             lowerMessage.includes('පන්තිය') || lowerMessage.includes('කාලසටහන') || lowerMessage.includes('panti')) {
      try {
        console.log('Chat request user ID:', req.user.id);
        console.log('Chat request user object:', req.user);

        const user = await User.findById(req.user.id);
        if (!user) {
          return next(new AppError('User not found', 404));
        }

        console.log('Found user in database:', { 
          id: user._id, 
          role: user.role, 
          degree: user.degree,
          email: user.email 
        });

        logger.info('User info:', { userId: user._id, role: user.role, degree: user.degree });

        // If user is not a student, return a message
        if (user.role !== 'student') {
          botResponse = getTranslation('student_only', detectedLanguage);
        } else if (!user.degree) {
          console.log('User degree is not set:', user.degree);
          botResponse = getTranslation('degree_not_set', detectedLanguage);
        } else {
          console.log('User degree is set:', user.degree);

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
            botResponse = getTranslation('no_schedules_today', detectedLanguage, { degree: user.degree });
          } else {
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
              botResponse = getTranslation('no_more_classes', detectedLanguage, { degree: user.degree });
            } else {
              let formattedResponse = getTranslation('remaining_classes', detectedLanguage, { degree: user.degree });
              
              relevantSchedules.forEach(schedule => {
                formattedResponse += `- ${schedule.startTime} to ${schedule.endTime}: ${schedule.className} (${schedule.location}) with ${schedule.instructor}\n`;
              });

              botResponse = formattedResponse.trim();
            }
          }
        }
      } catch (error) {
        logger.error('Error fetching schedules:', error);
        botResponse = getTranslation('error_fetching_schedule', detectedLanguage);
      }
    }
    // Check if the message is about bus routes
    else if (lowerMessage.includes('bus') || lowerMessage.includes('transport') ||
             lowerMessage.includes('பேருந்து') || lowerMessage.includes('போக்குவரத்து') ||
             lowerMessage.includes('බස්') || lowerMessage.includes('ප්‍රවාහන')) {
      try {
        const busRoutes = await BusRoute.find().sort({ route: 1 });
        
        if (busRoutes.length === 0) {
          botResponse = getTranslation('no_bus_routes', detectedLanguage);
        } else {
          let formattedResponse = getTranslation('available_routes', detectedLanguage);
          
          busRoutes.forEach(route => {
            formattedResponse += `${route.route}:\n`;
            formattedResponse += `Duration: ${route.duration}\n`;
            formattedResponse += `Schedule: ${route.schedule}\n\n`;
          });

          botResponse = formattedResponse.trim();
        }
      } catch (error) {
        logger.error('Error fetching bus routes:', error);
        botResponse = getTranslation('error_fetching_bus', detectedLanguage);
      }
    }
    // Check if the message is about events
    else if (lowerMessage.includes('event') || lowerMessage.includes('upcoming') ||
             lowerMessage.includes('நிகழ்வு') || lowerMessage.includes('வரவிருக்கும்') ||
             lowerMessage.includes('සිදුවීම') || lowerMessage.includes('ඉදිරි')) {
      try {
        const eventsResponse = await fetch('http://localhost:5000/api/events/chat');
        const eventsData = await eventsResponse.json() as any;
        
        if (!eventsData.data?.data?.upcoming || eventsData.data.data.upcoming.length === 0) {
          botResponse = getTranslation('no_events', detectedLanguage);
        } else {
          const events = eventsData.data.data.upcoming;
          let formattedResponse = getTranslation('upcoming_events', detectedLanguage);
          
          events.forEach((event: any) => {
            formattedResponse += `${event.name}\n`;
            formattedResponse += `Date: ${event.date}\n`;
            formattedResponse += `Time: ${event.time}\n`;
            formattedResponse += `Location: ${event.location}\n\n`;
          });

          botResponse = formattedResponse.trim();
        }
      } catch (error) {
        logger.error('Error fetching events:', error);
        botResponse = getTranslation('error_fetching_events', detectedLanguage);
      }
    }
    // For other messages, use enhanced fallback responses (OpenAI disabled)
    else {
      console.log('Using enhanced fallback response system...');
      botResponse = getTranslation('fallback_response', detectedLanguage);
    }

    // Save messages to database
    try {
      let chat = await Chat.findOne({ userId: req.user.id });
      
      if (!chat) {
        chat = new Chat({ userId: req.user.id, messages: [] });
      }

      // Add user message
      chat.messages.push({
        text: message,
        isUser: true,
        timestamp: new Date()
      });

      // Add bot response
      chat.messages.push({
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      });

      await chat.save();
      console.log('Chat history saved for user:', req.user.id);
    } catch (error) {
      console.error('Error saving chat history:', error);
      // Don't fail the request if chat history saving fails
    }

    console.log('Sending bot response:', botResponse);
    return res.status(200).json({
      status: 'success',
      data: {
        message: botResponse
      }
    });
  } catch (error) {
    logger.error('Error in chat controller:', error);
    return next(new AppError('An error occurred while processing your request', 500));
  }
});

export const getChatHistory = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const chat = await Chat.findOne({ userId: req.user.id });

    if (!chat) {
      return res.status(200).json({
        status: 'success',
        data: {
          messages: []
        }
      });
    }

    // Format messages for frontend
    const formattedMessages = chat.messages.map(msg => ({
      id: msg._id,
      text: msg.text,
      isUser: msg.isUser,
      timestamp: msg.timestamp,
      sentiment: msg.sentiment
    }));

    res.status(200).json({
      status: 'success',
      data: {
        messages: formattedMessages
      }
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    return next(new AppError('Error fetching chat history', 500));
  }
});

export const clearChat = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const result = await Chat.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { messages: [] } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Chat history cleared'
    });
  } catch (error) {
    logger.error('Clear chat error:', error);
    return next(new AppError('Error clearing chat history', 500));
  }
}); 