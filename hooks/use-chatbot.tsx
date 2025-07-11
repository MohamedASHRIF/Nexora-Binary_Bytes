"use client"

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Message } from '@/types';
import { analyzeSentiment } from "@/lib/nlp"
import { detectTampering } from "@/lib/tamper-detection"
import { useQueryLogs } from "@/hooks/use-query-logs"
import { useLanguage } from "@/hooks/use-language"
import { getScheduleData, getBusData, getCafeteriaData, getEventData, getFAQData } from "@/lib/data"
import type { ScheduleData, BusData, MenuData, FAQItem, BusItem, Event as EventType } from '@/lib/data'
import { createHash } from 'crypto'

// Common response templates
const greetingResponses = [
  "Hello! How can I help you today?",
  "Hi there! What can I do for you?",
  "Hey! I'm here to help. What do you need?",
  "Greetings! How may I assist you?",
  "Hello! I'm your campus assistant. What would you like to know?"
]

const thankYouResponses = [
  "You're welcome! Is there anything else I can help you with?",
  "Happy to help! Let me know if you need anything else.",
  "Anytime! Feel free to ask if you have more questions.",
  "My pleasure! Don't hesitate to ask if you need more assistance.",
  "Glad I could help! What else would you like to know?"
]

const goodbyeResponses = [
  "Goodbye! Have a great day!",
  "See you later! Take care!",
  "Bye! Come back if you need anything else!",
  "Farewell! Have a wonderful day!",
  "Take care! Don't hesitate to ask if you need help again!"
]

// Pattern matching for better intent detection
const patterns = {
  greeting: /^(hi|hello|hey|greetings|good\s(morning|afternoon|evening)|sup|yo|what's\sup|howdy)/i,
  thanks: /^(thanks|thank\syou|thx|appreciate\sit|cheers)/i,
  goodbye: /^(bye|goodbye|see\syou|farewell|take\scare|cya)/i,
  schedule: /(schedule|class|classes|clas|clases|clss|clsses|lecture|lectures|lectur|lecturs|course|courses|cours|cors|timetable|timetables|subject|subjects|subjct|subjcts|module|modules|modul|moduls|lesson|lessons|leson|lesons|academic|academc|study|studies|studdy|stdy|when\sis|what\stime|next\sclass|today\sclasses|tomorrow\sclasses|my\sschedule|class\stiming|lecture\stiming|course\sschedule)/i,
  bus: /(bus|buses|bs|buss|transport|transportation|transprt|transprtn|shuttle|shuttles|shutle|shutles|route|routes|rout|routs|timing|timings|timng|tming|when\sdoes\sthe\sbus|next\sbus|bus\stiming|transport\stiming|shuttle\stiming|bus\sroute|transport\sroute|how\sto\sget|how\sto\sreach|way\sto)/i,
  food: /(food|menu|menus|cafeteria|canteen|lunch|breakfast|dinner|meal|meals|dish|dishes|snack|snacks|restaurant|dining|refreshment|refreshments|beverage|beverages|drink|drinks|coffee|tea|juice|milk|water|eat|eating|hungry|starving|thirsty|fd|mn|cntn|lch|dnr|brkfst|ht|hngry|ml|dsh|snck|cfetria|rstrnt|dnng|drnk|cfee|t)/i,
  event: /(event|events|evnt|evnts|evet|evets|upcoming|upcomng|happening|happenings|hapning|hapnng|activity|activities|activty|activties|program|programs|progrm|progrms|fiesta|festa|festival|festivals|fstival|fstivals|celebration|celebrations|celbration|celbrations|ceremony|ceremonies|ceremny|ceremnies|function|functions|functon|functons|gathering|gatherings|gatherng|gatherngs|meeting|meetings|meting|metings|conference|conferences|confrence|confrences|party|parties|prty|prties|what\sis\shappening|what\sevents|any\sevents|today\sevents|tomorrow\sevents|this\sweek\sevents|next\sweek\sevents|campus\sevents|university\sevents)/i,
  location: /(where\sis|how\sto\sget\sto|directions\sto|map|location|locations|place|places|area|areas|zone|zones|section|sections|floor|floors|room|rooms|office|offices|department|departments|building|buildings|faculty|faculties|find|finding|locate|locating|navigate|navigation|way|path|route|routes)/i,
  help: /(help|how\sto|what\scan|what\sis|explain|tell\sme\sabout|guide|assist|support|information|info|question|questions|query|queries|doubt|doubts|confused|confusion|lost|stuck|problem|problems|issue|issues)/i
}

interface Event {
  date: string;
  name: string;
  location: string;
  time: string;
}

interface EventData {
  upcoming: Event[];
  tomorrow: Event[];
  categories: string[];
  registration: {
    required: string[];
    link: string;
  };
}

interface CachedData {
  timestamp: number;
  data: any;
  hash: string;
}

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const SAFE_DATA_KEY = 'safe_data';

const generateHash = (data: any): string => {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

const cacheData = (key: string, data: any) => {
  const hash = generateHash(data);
  const cachedData: CachedData = {
    timestamp: Date.now(),
    data,
    hash
  };
  localStorage.setItem(key, JSON.stringify(cachedData));
};

const getCachedData = (key: string): any | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { timestamp, data, hash }: CachedData = JSON.parse(cached);
  
  // Check if cache is expired
  if (Date.now() - timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(key);
    return null;
  }

  // Verify data integrity
  const currentHash = generateHash(data);
  if (currentHash !== hash) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
};

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    "What's my class schedule?",
    "Show my modules/subjects",
    "When is the next bus?",
    "What's on the cafeteria menu today?",
    "Any events or programs happening today?",
    "Where is the library?",
  ])
  const [context, setContext] = useState<{
    lastTopic?: string;
    lastLocation?: string;
    lastTime?: string;
    userName?: string;
  }>({})

  const { addQueryLog } = useQueryLogs()
  const { language, translate } = useLanguage()
  const router = useRouter();

  const [isOffline, setIsOffline] = useState(false);

  // Add offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update suggestions based on language
  useEffect(() => {
    const languageSuggestions = {
      en: [
        "What's my class schedule?",
        "Show my modules/subjects",
        "When is the next bus?",
        "What's on the cafeteria menu today?",
        "Any events or programs happening today?",
        "Where is the library?",
      ],
      si: [
        "මගේ පන්ති කාලසටහන කුමක්ද?",
        "මගේ මොඩියුල්/විෂයන් පෙන්වන්න",
        "ඊළඟ බස් එක කවදාද?",
        "අද කෑමෝටුවේ මෙනුව කුමක්ද?",
        "අද සිදුවන සිදුවීම් හෝ වැඩසටහන් තිබේද?",
        "පුස්තකාලය කොහෙද?",
      ],
      ta: [
        "என் வகுப்பு அட்டவணை என்ன?",
        "என் பாடப்பிரிவுகள்/பாடங்களை காட்டு",
        "அடுத்த பேருந்து எப்போது?",
        "இன்று உணவக மெனுவில் என்ன இருக்கிறது?",
        "இன்று நடக்கும் நிகழ்வுகள் அல்லது திட்டங்கள் உள்ளதா?",
        "நூலகம் எங்கே?",
      ]
    };
    
    setSuggestions(languageSuggestions[language] || languageSuggestions.en);
  }, [language]);

  // Replace the chat history loading useEffect with:
  useEffect(() => {
    setMessages([
      {
        text: translate('welcome'),
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      }
    ]);
    // Optionally, clear any persisted chat history here if needed
  }, [translate, setMessages]);

  // Helper function to get random response
  const getRandomResponse = (responses: string[]) => {
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Helper function to detect intent
  const detectIntent = (text: string): string => {
    const lowerText = text.toLowerCase().trim()
    let intent = ""

    // Check for compound intents
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerText)) {
        for (const [otherKey, otherPattern] of Object.entries(patterns)) {
          if (key !== otherKey && otherPattern.test(lowerText)) {
            return `${key}_${otherKey}`
          }
        }
        return key
      }
    }

    return intent
  }

  // Helper function to get follow-up suggestions based on intent
  const getFollowUpSuggestion = (intent: string): string[] => {
    switch (intent) {
      case "schedule":
        return ["Show tomorrow's schedule", "When is my next class?", "Show all classes", "Show my modules", "What subjects do I have?", "Show my assignments"]
      case "bus":
        return ["Show full bus schedule", "Bus to downtown", "Bus to residential area", "Next bus timing", "Bus routes", "Transport options"]
      case "food":
        return ["Show tomorrow's menu", "What's for lunch?", "Show dinner options", "Cafeteria hours", "Food options", "Meal timings"]
      case "event":
        return ["Show all events", "Upcoming workshops", "Event registration", "Campus programs", "Festivals", "Academic events", "Cultural activities"]
      case "location":
        return ["Show campus map", "Directions to library", "Find building", "Where is IT faculty?", "How to reach cafeteria?", "Campus navigation"]
      default:
        return ["Show schedule", "Bus timings", "Cafeteria menu", "Campus events", "Find location", "Show modules"]
    }
  }

  // Helper function to extract time references
  const extractTimeReference = (text: string): string | undefined => {
    const timePatterns = {
      today: /today|now|current/,
      tomorrow: /tomorrow|next day/,
      week: /this week|week/,
      month: /this month|month/,
    }

    for (const [time, pattern] of Object.entries(timePatterns)) {
      if (pattern.test(text.toLowerCase())) {
        return time
      }
    }
    return undefined
  }

  // Helper function to format schedule data
  const formatSchedule = (schedule: any[], timeRef?: string) => {
    if (!schedule.length) {
      return "No classes scheduled for this time period."
    }

    const timeContext = timeRef ? ` for ${timeRef}` : ""
    return `Here's your class schedule${timeContext}:\n\n${schedule
      .map((c) => `- ${c.time}: ${c.name} (${c.location})`)
      .join("\n")}`
  }

  // Helper function to detect tampering
  const isTamperingDetected = (text: string): boolean => {
    // Add your tampering detection logic here
    return false
  }

  // Helper function to detect negative sentiment
  const isNegativeSentiment = (text: string): boolean => {
    const negativeWords = ['bad', 'wrong', 'error', 'problem', 'issue', 'not working', 'broken', 'failed']
    return negativeWords.some(word => text.toLowerCase().includes(word))
  }

  // Modify the data fetching functions to use cache
  const fetchDataWithCache = async (key: string, fetchFn: () => Promise<any>) => {
    try {
      const data = await fetchFn();
      cacheData(key, data);
      return data;
    } catch (error) {
      const cachedData = getCachedData(key);
      if (cachedData) {
        return cachedData;
      }
      throw error;
    }
  };

  // Modify the processMessage function to handle offline mode
  const processMessage = useCallback(async (text: string): Promise<Message> => {
    const startTime = Date.now();
    try {
      let responseText = '';

      // Check if we're offline
      if (isOffline) {
        responseText = translate('offline');
      } else {
        // Process the message and get response
        responseText = translate('unknown');
      }

      // Log the query
      addQueryLog({
        query: text,
        response: responseText,
        timestamp: new Date(),
        sentiment: 0
      });

      return {
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        text: translate('error'),
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      };
    }
  }, [isOffline, translate, addQueryLog]);

  const sendMessage = async (text: string) => {
    const startTime = Date.now();
    try {
      setIsProcessing(true);

      // Make API call to chat endpoint
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('Sending request to:', `${apiUrl}/chat`);

      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: text,
          language: language // Send language preference to server
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response from server');
      }

      const data = await response.json();
      const botResponse = data.data.message;

      console.log('Received bot response:', botResponse);

      // Check if this is a location redirect
      if (botResponse.startsWith('LOCATION_REDIRECT:')) {
        console.log('Location redirect detected, switching to map tab');
        const parts = botResponse.split(':');
        if (parts.length >= 3) {
          const locationName = parts[1];
          const encodedLocation = parts[2];
          
          console.log('Switching to map tab for:', locationName);
          
          // Store the location data in localStorage for the map to use
          localStorage.setItem('highlightedLocation', JSON.stringify({
            name: locationName,
            encodedLocation: encodedLocation
          }));
          
          // Redirect to the map page
          router.push(`/map?locationName=${encodeURIComponent(locationName)}&encodedLocation=${encodeURIComponent(encodedLocation)}`);
          
          // Return a simple response to avoid errors
          const redirectMessage = language === 'si' ? 'සිතියම වෙත මාරු වෙමින්...' : 
                                 language === 'ta' ? 'வரைபடத்திற்கு மாற்றுகிறேன்...' : 
                                 'Switching to map...';
          return {
            type: 'redirected',
            data: redirectMessage
          };
        }
      }

      // Check if this is an insights game redirect
      if (botResponse.startsWith('INSIGHTS_GAME_REDIRECT:')) {
        console.log('Insights game redirect detected');
        
        // Redirect to the insights page with sentiment view
        router.push('/insights?view=sentiment');
        
        // Return a simple response to avoid errors
        const redirectMessage = language === 'si' ? 'සංවේදන ක්‍රීඩාව වෙත මාරු වෙමින්...' : 
                               language === 'ta' ? 'உணர்ச்சி விளையாட்டுக்கு மாற்றுகிறேன்...' : 
                               'Switching to sentiment game...';
        return {
          type: 'redirected',
          data: redirectMessage
        };
      }

      // Check if this is a game redirect
      if (botResponse.startsWith('GAME_REDIRECT:')) {
        console.log('Game redirect detected');
        
        // Redirect to the game page
        router.push('/game');
        
        // Return a simple response to avoid errors
        const redirectMessage = language === 'si' ? 'ක්‍රීඩාව වෙත මාරු වෙමින්...' : 
                               language === 'ta' ? 'விளையாட்டுக்கு மாற்றுகிறேன்...' : 
                               'Taking you to the game...';
        return {
          type: 'redirected',
          data: redirectMessage
        };
      }



      console.log('Normal response, adding to messages');
      // Add bot response to messages only for normal responses
      const botMessage: Message = {
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      };
      setMessages(prev => [...prev, botMessage]);

      // Log the query
      addQueryLog({
        query: text,
        response: botResponse,
        timestamp: new Date(),
        sentiment: 0
      });

      return {
        type: 'normal',
        data: botResponse
      };
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        text: translate('error'),
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      };
      setMessages(prev => [...prev, errorMessage]);
      return {
        type: 'error',
        data: translate('error')
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear chat history
  const clearChat = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await fetch(`${apiUrl}/chat/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error clearing server chat history:', error);
    }

    // Clear local messages and context
    setMessages([
      {
        text: translate('welcome'),
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      }
    ]);
    setContext({});
  }, [translate]);

  return {
    messages,
    sendMessage,
    isProcessing,
    suggestions,
    clearChat,
    setMessages,
  }
}
