import { useState, useCallback, useEffect } from 'react';
import schedules from '../app/data/schedules.json';
import busTimings from '../app/data/bus_timings.json';
import menus from '../app/data/menus.json';
import events from '../app/data/events.json';

interface Intent {
  type: string;
  confidence: number;
  entities?: Record<string, string>;
}

interface ConversationMemory {
  question: string;
  response: string;
  timestamp: number;
  feedback?: 'positive' | 'negative';
}

interface LearningData {
  patterns: Record<string, string[]>;
  responses: Record<string, string[]>;
  feedback: Record<string, number>;
}

// Initialize learning data from localStorage or create new
const getLearningData = (): LearningData => {
  if (typeof window === 'undefined') {
    return {
      patterns: {},
      responses: {},
      feedback: {}
    };
  }
  const stored = localStorage.getItem('chatLearningData');
  return stored ? JSON.parse(stored) : {
    patterns: {},
    responses: {},
    feedback: {}
  };
};

// Save learning data to localStorage
const saveLearningData = (data: LearningData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatLearningData', JSON.stringify(data));
  }
};

const detectIntent = (message: string, learningData: LearningData): Intent => {
  const lowerMessage = message.toLowerCase();
  
  // Check learned patterns first
  for (const [pattern, responses] of Object.entries(learningData.patterns)) {
    if (lowerMessage.includes(pattern)) {
      return { type: 'learned', confidence: 0.9, entities: { pattern } };
    }
  }
  
  // Fallback to rule-based detection
  if (lowerMessage.includes('schedule') || lowerMessage.includes('class')) {
    return { type: 'schedule', confidence: 0.8 };
  }
  if (lowerMessage.includes('bus') || lowerMessage.includes('transport')) {
    return { type: 'bus', confidence: 0.8 };
  }
  if (lowerMessage.includes('food') || lowerMessage.includes('menu') || lowerMessage.includes('cafeteria')) {
    return { type: 'menu', confidence: 0.8 };
  }
  if (lowerMessage.includes('event') || lowerMessage.includes('upcoming')) {
    return { type: 'events', confidence: 0.8 };
  }
  
  return { type: 'unknown', confidence: 0 };
};

const generateResponse = async (
  intent: Intent,
  message: string,
  learningData: LearningData,
  userDegree?: string
): Promise<string> => {
  // Handle learned patterns
  if (intent.type === 'learned' && intent.entities?.pattern) {
    const pattern = intent.entities.pattern;
    const responses = learningData.responses[pattern] || [];
    if (responses.length > 0) {
      const bestResponse = responses.reduce((best, current) => {
        const bestScore = learningData.feedback[best] || 0;
        const currentScore = learningData.feedback[current] || 0;
        return currentScore > bestScore ? current : best;
      });
      return bestResponse;
    }
  }

  // Handle structured data responses
  switch (intent.type) {
    case 'schedule':
      if (!userDegree) {
        return "I need to know your degree to show your schedule. Please make sure you're logged in with your student account.";
      }
      try {
        const response = await fetch(`/api/schedules?degree=${userDegree}`);
        const data = await response.json();
        
        if (!data.data.schedules || data.data.schedules.length === 0) {
          return "I couldn't find any schedules for your degree. Please check back later.";
        }

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySchedules = data.data.schedules.filter((s: any) => s.day === today);
        
        if (todaySchedules.length === 0) {
          return "You don't have any classes scheduled for today.";
        }

        return `Here are your classes for today:\n${todaySchedules
          .map((s: any) => `${s.className} at ${s.startTime} in ${s.location}`)
          .join('\n')}`;
      } catch (error) {
        console.error('Error fetching schedules:', error);
        return "Sorry, I couldn't fetch your schedule. Please try again later.";
      }
    
    case 'bus':
      return `Next bus timings:\n${busTimings.bus_routes
        .map(r => `${r.route}: ${r.schedule.slice(0, 3).join(', ')}`)
        .join('\n')}`;
    
    case 'menu':
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayMenu = menus.daily_menus[today as keyof typeof menus.daily_menus];
      if (todayMenu) {
        return `Today's menu:\nBreakfast: ${todayMenu.breakfast.join(', ')}\nLunch: ${todayMenu.lunch.join(', ')}\nDinner: ${todayMenu.dinner.join(', ')}`;
      }
      return "Sorry, I couldn't find today's menu.";
    
    case 'events':
      return `Upcoming events:\n${events.upcoming_events
        .map(e => `${e.title} on ${e.date} at ${e.time} in ${e.location}`)
        .join('\n')}`;
    
    default:
      // For unknown intents, try to learn from the conversation
      const keyPhrases = message.toLowerCase().split(' ').filter(word => word.length > 3);
      for (const phrase of keyPhrases) {
        if (!learningData.patterns[phrase]) {
          learningData.patterns[phrase] = [];
          learningData.responses[phrase] = [];
        }
      }
      return "I'm not sure I understand. You can ask me about class schedules, bus timings, cafeteria menus, or upcoming events. I'm also learning from our conversation!";
  }
};

export const useChatLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [learningData, setLearningData] = useState<LearningData>({
    patterns: {},
    responses: {},
    feedback: {}
  });
  const [conversationHistory, setConversationHistory] = useState<ConversationMemory[]>([]);

  // Initialize learning data from localStorage on client side
  useEffect(() => {
    setLearningData(getLearningData());
  }, []);

  // Save learning data when it changes
  useEffect(() => {
    saveLearningData(learningData);
  }, [learningData]);

  const processMessage = useCallback(async (message: string): Promise<string> => {
    setIsLoading(true);
    try {
      const intent = detectIntent(message, learningData);
      const response = await generateResponse(intent, message, learningData);
      
      // Update conversation history
      setConversationHistory(prev => [...prev, {
        question: message,
        response,
        timestamp: Date.now()
      }]);

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I'm sorry, I encountered an error while processing your request.";
    } finally {
      setIsLoading(false);
    }
  }, [learningData]);

  const provideFeedback = useCallback((question: string, response: string, feedback: 'positive' | 'negative') => {
    setLearningData(prev => {
      const newData = { ...prev };
      const keyPhrases = question.toLowerCase().split(' ').filter(word => word.length > 3);
      
      for (const phrase of keyPhrases) {
        if (!newData.patterns[phrase]) {
          newData.patterns[phrase] = [];
          newData.responses[phrase] = [];
        }
        if (!newData.responses[phrase].includes(response)) {
          newData.responses[phrase].push(response);
        }
        newData.feedback[response] = (newData.feedback[response] || 0) + (feedback === 'positive' ? 1 : -1);
      }
      
      return newData;
    });

    // Update conversation history with feedback
    setConversationHistory(prev => 
      prev.map(conv => 
        conv.question === question && conv.response === response
          ? { ...conv, feedback }
          : conv
      )
    );
  }, []);

  return {
    processMessage,
    isLoading,
    provideFeedback,
    conversationHistory
  };
}; 