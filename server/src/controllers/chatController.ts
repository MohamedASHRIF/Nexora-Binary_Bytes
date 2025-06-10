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

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const lowerMessage = message.toLowerCase();
    logger.info('Received chat message:', { message, user: req.user });

    let botResponse = '';

    // Check if the message is about class schedules
    if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
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
          botResponse = "I can only show class schedules for students. Please contact the admin for more information.";
        } else if (!user.degree) {
          console.log('User degree is not set:', user.degree);
          botResponse = "Your degree information is not set. Please contact the admin to set your degree.";
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
            botResponse = `I don't see any class schedules for ${user.degree} degree today.`;
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
              botResponse = `You don't have any more ${user.degree} classes scheduled for today.`;
            } else {
              let formattedResponse = `Here are your remaining ${user.degree} classes for today:\n\n`;
              
              relevantSchedules.forEach(schedule => {
                formattedResponse += `- ${schedule.startTime} to ${schedule.endTime}: ${schedule.className} (${schedule.location}) with ${schedule.instructor}\n`;
              });

              botResponse = formattedResponse.trim();
            }
          }
        }
      } catch (error) {
        logger.error('Error fetching schedules:', error);
        botResponse = 'Sorry, I encountered an error while fetching your schedule. Please try again.';
      }
    }
    // Check if the message is about bus routes
    else if (lowerMessage.includes('bus') || lowerMessage.includes('transport')) {
      try {
        const busRoutes = await BusRoute.find().sort({ route: 1 });
        
        if (busRoutes.length === 0) {
          botResponse = "I don't see any bus routes in the system yet. Please ask an admin to add some routes.";
        } else {
          let formattedResponse = "Here are the available bus routes:\n\n";
          
          busRoutes.forEach(route => {
            formattedResponse += `${route.route}:\n`;
            formattedResponse += `Duration: ${route.duration}\n`;
            formattedResponse += `Schedule: ${route.schedule}\n\n`;
          });

          botResponse = formattedResponse.trim();
        }
      } catch (error) {
        logger.error('Error fetching bus routes:', error);
        botResponse = 'Sorry, I encountered an error while fetching bus routes. Please try again.';
      }
    }
    // Check if the message is about events
    else if (lowerMessage.includes('event') || lowerMessage.includes('upcoming')) {
      try {
        const eventsResponse = await fetch('http://localhost:5000/api/events/chat');
        const eventsData = await eventsResponse.json() as any;
        
        if (!eventsData.data?.data?.upcoming || eventsData.data.data.upcoming.length === 0) {
          botResponse = "I don't see any upcoming events in the system yet. Please ask an admin to add some events.";
        } else {
          const events = eventsData.data.data.upcoming;
          let formattedResponse = "Here are the upcoming events:\n\n";
          
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
        botResponse = 'Sorry, I encountered an error while fetching events. Please try again.';
      }
    }
    // For other messages, use enhanced fallback responses (OpenAI disabled)
    else {
      console.log('Using enhanced fallback response system...');
      botResponse = getFallbackResponse(message);
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

// Helper function to generate fallback responses
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();
  const currentHour = new Date().getHours();

  // Time-based greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('greetings')) {
    let timeGreeting = "";
    if (currentHour < 12) {
      timeGreeting = "Good morning! ";
    } else if (currentHour < 17) {
      timeGreeting = "Good afternoon! ";
    } else {
      timeGreeting = "Good evening! ";
    }

    const greetings = [
      `${timeGreeting}How are you doing today? I'm here to help with anything campus-related!`,
      `${timeGreeting}Great to see you! How can I assist you with your campus needs?`,
      `${timeGreeting}Welcome to your campus assistant. What would you like to know today?`,
      `${timeGreeting}I'm here to make your campus life easier. What can I help you with?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Time-based responses
  if (lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
    const timeResponses = [
      "Same to you! I hope you're having a wonderful day. How can I help you with campus matters?",
      "Thank you! I hope your day is going great. What campus information do you need?",
      "You too! I'm here to make your day easier. What can I assist you with?",
      "Same to you! Ready to help you with anything campus-related. What's on your mind?"
    ];
    return timeResponses[Math.floor(Math.random() * timeResponses.length)];
  }

  // Goodbyes
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you') || lowerMessage.includes('farewell')) {
    const goodbyes = [
      "Goodbye! Have a wonderful day ahead! Don't hesitate to come back if you need anything.",
      "See you later! Take care and enjoy your campus experience!",
      "Bye! Have a great day! Remember, I'm always here to help when you need me.",
      "Farewell! Wishing you a productive and enjoyable day!"
    ];
    return goodbyes[Math.floor(Math.random() * goodbyes.length)];
  }

  // Thank you responses
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('thx') || lowerMessage.includes('appreciate')) {
    const thanks = [
      "You're very welcome! I'm happy to help. Is there anything else you'd like to know?",
      "My pleasure! Helping you makes my day. What else can I assist you with?",
      "Anytime! That's what I'm here for. Don't hesitate to ask if you need more help!",
      "You're welcome! I'm glad I could help. What's next on your mind?"
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }

  // Emotional states - tired, stressed, overwhelmed
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('sleepy')) {
    const tired = [
      "I understand feeling tired! Remember to take breaks and stay hydrated. Maybe grab a coffee from the cafeteria? You've got this! 💪",
      "Being tired is tough, but you're doing great! Consider taking a short walk around campus to refresh yourself. You're stronger than you think!",
      "It's okay to feel tired! Make sure you're getting enough rest. Maybe check your schedule to see if you can take a short break? You're making progress!",
      "Tiredness is temporary, but your determination is permanent! Take care of yourself and remember why you started. You've got this! 🌟"
    ];
    return tired[Math.floor(Math.random() * tired.length)];
  }

  if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
    const stressed = [
      "I hear you, stress can be overwhelming! Take deep breaths and remember you're capable of handling this. Maybe check your schedule to plan ahead? You're not alone!",
      "Stress is tough, but you're tougher! Try breaking things down into smaller tasks. I can help you check your schedule or find resources. You've got this! 💪",
      "It's completely normal to feel stressed! Remember to breathe and take it one step at a time. Would you like me to help you check your upcoming schedule?",
      "You're doing better than you think! Stress is temporary, but your strength is permanent. Let's tackle this together - what's on your mind?"
    ];
    return stressed[Math.floor(Math.random() * stressed.length)];
  }

  if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much') || lowerMessage.includes('can\'t handle')) {
    const overwhelmed = [
      "I understand feeling overwhelmed! Let's break this down together. What's the most pressing thing on your mind right now? We'll tackle it step by step!",
      "Being overwhelmed is completely normal! Take a moment to breathe. Let me help you check your schedule or find what you need. You're not alone in this!",
      "It's okay to feel overwhelmed! Remember, you don't have to figure everything out at once. What's the first thing you'd like to focus on? I'm here to help!",
      "You're stronger than you think! Being overwhelmed is temporary. Let's start with one thing - what's most important right now? We'll work through this together! 💪"
    ];
    return overwhelmed[Math.floor(Math.random() * overwhelmed.length)];
  }

  // Additional emotional states
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
    const sad = [
      "I'm sorry you're feeling down. Remember that it's okay to not be okay sometimes. You're not alone, and there are people who care about you. Maybe try talking to a friend or counselor? You matter! 💙",
      "I hear you, and your feelings are valid. Tough times don't last forever, but tough people do. You're stronger than you realize. Is there something specific that's bothering you?",
      "It's completely normal to feel sad sometimes. Remember to be kind to yourself. Maybe take a walk around campus or do something that usually makes you feel better? You've got this! 🌟",
      "I'm here for you. Sometimes just talking about what's on your mind can help. You're doing better than you think, and brighter days are ahead. What's on your heart?"
    ];
    return sad[Math.floor(Math.random() * sad.length)];
  }

  if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
    const angry = [
      "I understand feeling frustrated! It's okay to be angry sometimes. Try taking a few deep breaths or maybe go for a walk to clear your mind. What's got you feeling this way?",
      "Anger is a natural emotion, but don't let it control you. Maybe try channeling that energy into something productive? I'm here to listen if you want to talk about it.",
      "I hear your frustration! Sometimes things just don't go our way. Remember, this feeling will pass. What can I help you with to make things better?",
      "It's okay to feel angry! Just remember to breathe and not make any decisions while you're upset. What's causing this frustration? Maybe we can work through it together."
    ];
    return angry[Math.floor(Math.random() * angry.length)];
  }

  if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('no friends')) {
    const lonely = [
      "I understand feeling lonely, but you're not truly alone! There are so many people on campus who would love to connect with you. Maybe try joining a club or attending campus events? You're worthy of friendship! 💙",
      "Loneliness is tough, but it's temporary! There are many ways to meet people on campus. Have you considered joining study groups or campus activities? You have so much to offer!",
      "I'm here for you! Loneliness can be really hard, but remember that making friends takes time. You're not alone in feeling this way. What interests you? Maybe I can suggest some campus activities!",
      "You're not alone, even if it feels that way! There are many students who feel the same. Try reaching out to classmates or joining campus events. You're amazing and deserve great friendships! 🌟"
    ];
    return lonely[Math.floor(Math.random() * lonely.length)];
  }

  // Academic stress and study-related emotions
  if (lowerMessage.includes('study') && (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('struggling'))) {
    const studyStress = [
      "Studying can be challenging, but you're capable of great things! Try breaking your study sessions into smaller chunks. Maybe check your schedule to plan better study times? You've got this! 📚",
      "I understand study stress! Remember, it's about progress, not perfection. Take breaks, stay hydrated, and don't be too hard on yourself. What subject are you finding challenging?",
      "Study struggles are completely normal! Try different study techniques or form study groups. I can help you check your schedule to find the best study times. You're doing better than you think! 💪",
      "You're not alone in finding studying difficult! Many students feel this way. Try studying in shorter sessions with breaks. What specific topic is giving you trouble? We can work through this together!"
    ];
    return studyStress[Math.floor(Math.random() * studyStress.length)];
  }

  if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('quiz')) {
    const examStress = [
      "Exam stress is real! Remember to breathe and trust in your preparation. You've worked hard for this. Maybe check your schedule to see when your next exam is? You've got this! 📝",
      "I understand exam anxiety! It's completely normal to feel nervous. Remember, you're more prepared than you think. Take deep breaths and believe in yourself!",
      "Exams can be overwhelming, but you're stronger than your anxiety! Trust your knowledge and don't let fear control you. What exam are you preparing for?",
      "You've got this! Exam stress is temporary, but your knowledge is permanent. Remember to take care of yourself and get enough rest. You're going to do great! 🌟"
    ];
    return examStress[Math.floor(Math.random() * examStress.length)];
  }

  // Motivation and encouragement
  if (lowerMessage.includes('can\'t') || lowerMessage.includes('impossible') || lowerMessage.includes('too hard')) {
    const motivation = [
      "I believe in you! What seems impossible today might be your biggest achievement tomorrow. Let's break it down into smaller, manageable steps!",
      "You're more capable than you think! Every challenge is an opportunity to grow. What specific part feels difficult? I'm here to help you figure it out!",
      "Remember, you've overcome challenges before! This is just another step in your journey. What's the first small thing you can do? You've got this! 💪",
      "Nothing is impossible when you believe in yourself! Let's tackle this together. What's one thing you can do right now to move forward?"
    ];
    return motivation[Math.floor(Math.random() * motivation.length)];
  }

  // Success and achievement
  if (lowerMessage.includes('passed') || lowerMessage.includes('success') || lowerMessage.includes('achieved') || lowerMessage.includes('did it')) {
    const success = [
      "🎉 Congratulations! That's amazing! You worked hard for this and you deserve to celebrate. What's your next goal? I'm so proud of you!",
      "🌟 Wow, that's fantastic! Your hard work paid off. Remember this feeling of success - you're capable of great things! What's next on your journey?",
      "💪 You did it! That's incredible! Your determination and effort made this happen. Keep up the amazing work - you're unstoppable!",
      "🎊 That's wonderful news! You should be so proud of yourself. This success shows what you're capable of. What achievement are you going for next?"
    ];
    return success[Math.floor(Math.random() * success.length)];
  }

  // Questions about the bot's capabilities
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('help me') || lowerMessage.includes('how can you help')) {
    return "I'm your campus assistant and I can help you with:\n\n" +
           "📚 **Class Schedules** - Check your daily classes and timings\n" +
           "🚌 **Bus Routes** - Find bus schedules and routes\n" +
           "🍽️ **Cafeteria** - Check today's menu and food options\n" +
           "🎉 **Events** - Discover upcoming campus events\n" +
           "🗺️ **Locations** - Find buildings and get directions\n" +
           "💬 **General Help** - Ask me anything about campus life!\n\n" +
           "What would you like to know about?";
  }

  // Questions about classes/schedule
  if (lowerMessage.includes('class') || lowerMessage.includes('schedule') || lowerMessage.includes('lecture')) {
    return "I can help you with your class schedule! Try asking:\n" +
           "• 'What's my schedule today?'\n" +
           "• 'Show me my classes'\n" +
           "• 'When is my next class?'\n\n" +
           "I'll show you your personalized schedule based on your degree!";
  }

  // Questions about transportation
  if (lowerMessage.includes('bus') || lowerMessage.includes('transport') || lowerMessage.includes('shuttle')) {
    return "I can help you with bus information! Try asking:\n" +
           "• 'Show me bus routes'\n" +
           "• 'When is the next bus?'\n" +
           "• 'Bus schedule'\n\n" +
           "I'll show you all available routes and timings!";
  }

  // Questions about food
  if (lowerMessage.includes('food') || lowerMessage.includes('menu') || lowerMessage.includes('cafeteria') || lowerMessage.includes('lunch')) {
    return "I can help you with cafeteria information! Try asking:\n" +
           "• 'What's on the menu today?'\n" +
           "• 'Show me cafeteria menu'\n" +
           "• 'What's for lunch?'\n\n" +
           "I'll show you today's food options!";
  }

  // Questions about events
  if (lowerMessage.includes('event') || lowerMessage.includes('activity') || lowerMessage.includes('happening')) {
    return "I can help you with campus events! Try asking:\n" +
           "• 'What events are happening?'\n" +
           "• 'Show me upcoming events'\n" +
           "• 'Any activities today?'\n\n" +
           "I'll show you all the exciting events on campus!";
  }

  // Questions about location/directions
  if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('directions')) {
    return "I can help you find locations on campus! Try asking:\n" +
           "• 'Where is the library?'\n" +
           "• 'How do I get to the cafeteria?'\n" +
           "• 'Directions to [building name]'\n\n" +
           "I'll help you navigate around campus!";
  }

  // Personal questions about the user
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'s it going')) {
    const responses = [
      "I'm doing great, thank you for asking! I'm here and ready to help you with anything campus-related. How are you doing?",
      "I'm functioning perfectly and excited to assist you! How's your day going so far?",
      "I'm doing well! Always happy to help students and staff. What's on your mind today?",
      "I'm excellent! Ready to make your campus experience better. How can I help you today?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Compliments
  if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('amazing')) {
    const compliments = [
      "That's wonderful to hear! I'm glad things are going well for you. Is there anything I can help you with to make it even better?",
      "That's fantastic! It's great when things are working out. What's next on your agenda?",
      "Excellent! I love hearing positive news. How can I help you continue this momentum?",
      "That's amazing! Keep up the great work. What else would you like to accomplish today?"
    ];
    return compliments[Math.floor(Math.random() * compliments.length)];
  }

  // Common student scenarios
  if (lowerMessage.includes('missed') || lowerMessage.includes('late') || lowerMessage.includes('overslept')) {
    const missedClass = [
      "Don't worry! It happens to everyone. Check your schedule to see what's next and try to catch up. Maybe set multiple alarms for tomorrow? You've got this! ⏰",
      "It's okay! Missing one class isn't the end of the world. Check your schedule to see what's coming up next. Try to get some notes from a classmate if possible!",
      "No stress! These things happen. Let me help you check your schedule to see what's next. Maybe try going to bed earlier tonight? You're still doing great!",
      "Don't beat yourself up! Check your schedule to see what's next and focus on that. Maybe set up a study group to catch up? You've got this! 💪"
    ];
    return missedClass[Math.floor(Math.random() * missedClass.length)];
  }

  if (lowerMessage.includes('hungry') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    const hungry = [
      "I can help you find food! Check the cafeteria menu or let me know what you're in the mood for. There are usually great options available! 🍽️",
      "Time to fuel up! I can show you today's cafeteria menu or help you find other food options on campus. What sounds good to you?",
      "Let's get you some food! I can help you check what's available in the cafeteria or suggest other campus dining options. What are you craving?",
      "Food is important! I can show you the cafeteria menu or help you find other places to eat on campus. What would you like to know about?"
    ];
    return hungry[Math.floor(Math.random() * hungry.length)];
  }

  if (lowerMessage.includes('bored') || lowerMessage.includes('nothing to do')) {
    const bored = [
      "Let's find something fun to do! I can show you upcoming campus events or help you discover new activities. There's always something happening on campus! 🎉",
      "Boredom is temporary! Let me show you what events are happening on campus or help you find interesting activities. What interests you?",
      "There's so much to do on campus! I can help you find events, clubs, or activities that might interest you. What kind of things do you enjoy?",
      "Let's spice up your day! I can show you upcoming campus events or help you discover new opportunities. What sounds exciting to you?"
    ];
    return bored[Math.floor(Math.random() * bored.length)];
  }

  if (lowerMessage.includes('weather') || lowerMessage.includes('cold') || lowerMessage.includes('hot')) {
    const weather = [
      "I hope the weather isn't affecting your day too much! Remember to dress appropriately and stay comfortable. Maybe check your schedule to plan indoor activities?",
      "Weather can really impact our mood! Make sure you're dressed for the conditions and stay comfortable. What's on your schedule today?",
      "I hope you're staying comfortable in this weather! Remember to dress appropriately and maybe plan some indoor activities. How's your day going?",
      "Weather can be challenging! Make sure you're taking care of yourself and staying comfortable. What do you have planned for today?"
    ];
    return weather[Math.floor(Math.random() * weather.length)];
  }

  // Questions about campus life
  if (lowerMessage.includes('campus') || lowerMessage.includes('university') || lowerMessage.includes('college')) {
    const campusLife = [
      "Campus life is what you make of it! I can help you find events, activities, and resources to make the most of your university experience. What interests you?",
      "University life is full of opportunities! I can help you discover events, clubs, and activities that match your interests. What would you like to explore?",
      "Campus life is amazing! I'm here to help you navigate everything from classes to events to social activities. What aspect of campus life would you like to know more about?",
      "Your university experience is what you make it! I can help you find ways to get involved, discover new interests, and make the most of your time here. What's on your mind?"
    ];
    return campusLife[Math.floor(Math.random() * campusLife.length)];
  }

  // Confusion or unclear messages
  if (lowerMessage.includes('what') || lowerMessage.includes('huh') || lowerMessage.includes('confused')) {
    return "I'm here to help! I can assist you with:\n\n" +
           "• Class schedules and timings\n" +
           "• Bus routes and transportation\n" +
           "• Cafeteria menus and food options\n" +
           "• Campus events and activities\n" +
           "• Location directions\n" +
           "• General campus information\n\n" +
           "What would you like to know about? Just ask me anything!";
  }

  // Default response for unrecognized messages
  const defaultResponses = [
    "I'm here to help with campus-related questions! You can ask me about your class schedule, bus routes, cafeteria menu, campus events, or any other campus information. What would you like to know?",
    "That's interesting! I'm your campus assistant and I can help you with schedules, transportation, food, events, and more. What campus-related question do you have?",
    "I'd love to help! I can provide information about classes, buses, cafeteria, events, and campus locations. What would you like to know about?",
    "I'm your campus assistant! I can help you with class schedules, bus timings, cafeteria menus, campus events, and finding locations. What can I help you with today?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

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