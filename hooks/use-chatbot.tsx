"use client"

import { useState, useCallback, useEffect } from "react"
import type { Message } from "@/types"
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
  schedule: /(schedule|class|lecture|course|timetable|when\sis|what\stime)/i,
  bus: /(bus|shuttle|transport|route|when\sdoes\sthe\sbus|next\sbus)/i,
  food: /(food|menu|cafeteria|canteen|lunch|breakfast|dinner|meal)/i,
  event: /(event|activity|program|workshop|seminar|conference)/i,
  location: /(where\sis|how\sto\sget\sto|directions\sto|map|location)/i,
  help: /(help|how\sto|what\scan|what\sis|explain|tell\sme\sabout)/i
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
    "When is the next bus?",
    "What's on the cafeteria menu today?",
    "Any events happening today?",
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

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        text: "Hello! I'm your campus assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      }
    ])
  }, [])

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
        return ["Show tomorrow's schedule", "When is my next class?", "Show all classes"]
      case "bus":
        return ["Show full bus schedule", "Bus to downtown", "Bus to residential area"]
      case "food":
        return ["Show tomorrow's menu", "What's for lunch?", "Show dinner options"]
      case "event":
        return ["Show all events", "Upcoming workshops", "Event registration"]
      case "location":
        return ["Show campus map", "Directions to library", "Find building"]
      default:
        return ["Show schedule", "Bus timings", "Cafeteria menu", "Campus events", "Find location"]
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
    try {
      const lowerText = text.toLowerCase().trim();
      let responseText = "";
      let intent = detectIntent(text);
      const timeRef = extractTimeReference(lowerText);

      // Add offline mode message
      if (isOffline) {
        responseText = "You're currently offline. I'll try to use cached data, but some features may be limited.";
      }

      // Handle compound intents
      if (intent.includes("_")) {
        const [primary, secondary] = intent.split("_")
        if (primary === "bus" && secondary === "schedule") {
          // Handle bus schedule query
          const busData = await fetchDataWithCache('bus', getBusData)
          const nextBuses = busData.nextBuses
            .filter((b: BusItem) => !timeRef || b.time.includes(timeRef))
            .slice(0, 5)

          if (nextBuses.length === 0) {
            responseText = "I couldn't find any bus schedules for the requested time. Here are the main bus routes available:\n\n" +
              busData.routes.map((route: { name: string; description: string }) => `- ${route.name}: ${route.description}`).join("\n") +
              "\n\nWould you like to know the schedule for a specific route?"
          } else {
            const routeGroups = nextBuses.reduce((groups: { [key: string]: BusItem[] }, bus: BusItem) => {
              if (!groups[bus.route]) {
                groups[bus.route] = []
              }
              groups[bus.route].push(bus)
              return groups
            }, {})

            responseText = "Here are the upcoming bus schedules:\n\n"
            for (const [route, buses] of Object.entries(routeGroups) as [string, BusItem[]][]) {
              responseText += `${route}:\n`
              for (const bus of buses) {
                responseText += `- ${bus.time} → ${bus.destination}\n`
              }
              responseText += "\n"
            }
            responseText += "\nWould you like to know more about a specific route or see the full schedule?"
          }
        }
      } else {
        // Handle single intents
        switch (intent) {
          case "greeting":
            responseText = getRandomResponse(greetingResponses)
            break
          case "thanks":
            responseText = getRandomResponse(thankYouResponses)
            break
          case "goodbye":
            responseText = getRandomResponse(goodbyeResponses)
            break
          case "schedule":
            const scheduleData = await fetchDataWithCache('schedule', getScheduleData)
            if (scheduleData.classes.length === 0) {
              responseText = "I couldn't find any classes scheduled for the requested time."
            } else {
              responseText = formatSchedule(scheduleData.classes)
            }
            break
          case "bus":
            const busData = await fetchDataWithCache('bus', getBusData)
            const nextBuses = busData.nextBuses
              .filter((b: BusItem) => !timeRef || b.time.includes(timeRef))
              .slice(0, 5)

            if (nextBuses.length === 0) {
              responseText = "I couldn't find any bus schedules for the requested time."
            } else {
              responseText = "Here are the next buses:\n\n" +
                nextBuses.map((bus: BusItem) => `- ${bus.time}: ${bus.route} to ${bus.destination}`).join("\n")
            }
            break
          case "food":
            const menuData = await getCafeteriaData()
            const menu = timeRef === "tomorrow" ? menuData.tomorrow : menuData.today
            if (!menu || Object.keys(menu).length === 0) {
              responseText = "Menu information is not available for the requested time."
            } else {
              responseText = `Today's cafeteria menu:\n\n${Object.entries(menu)
                .map(([meal, items]) => `${meal}: ${Array.isArray(items) ? items.join(", ") : items}`)
                .join("\n\n")}`
            }
            break
          case "event":
            const eventData = await getEventData()
            if (eventData.upcoming.length === 0) {
              responseText = "No upcoming events found for the requested time."
            } else {
              responseText = `Upcoming events:\n\n${eventData.upcoming
                .map((event: EventType) => `- ${event.name} (${event.date} at ${event.time})\n  Location: ${event.location}`)
                .join("\n\n")}`
            }
            break
          case "location":
            responseText = "I can help you find locations on campus. Would you like to see the campus map or get directions to a specific place?"
            break
          case "help":
            responseText = "I can help you with:\n" +
              "- Class schedules and timetables\n" +
              "- Bus routes and schedules\n" +
              "- Cafeteria menus and food options\n" +
              "- Campus events and activities\n" +
              "- Location directions and maps\n\n" +
              "What would you like to know more about?"
            break
          default:
            // Try to find a matching FAQ
            const faqData = await getFAQData()
            const matchedFaq = faqData.find((faq: FAQItem) => lowerText.includes(faq.question.toLowerCase()))
            if (matchedFaq) {
              responseText = matchedFaq.answer
            } else {
              responseText = "I'm not sure I understand. Could you please rephrase your question or try asking about:\n" +
                "- Class schedules\n" +
                "- Bus routes\n" +
                "- Cafeteria menu\n" +
                "- Campus events\n" +
                "- Location directions"
            }
        }
      }

      // Update suggestions based on the current context
      const newSuggestions = getFollowUpSuggestion(intent)
      setSuggestions(newSuggestions)

      // Update context
      setContext(prev => ({
        ...prev,
        lastTopic: intent,
        lastTime: timeRef
      }))

      return {
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      }
    } catch (error) {
      console.error('Error processing message:', error)
      return {
        text: isOffline 
          ? "I'm having trouble accessing the data while offline. Please try again when you're back online."
          : "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      }
    }
  }, [isOffline])

  const sendMessage = async (text: string) => {
    try {
      setIsProcessing(true)

      // Add user message
      const userMessage: Message = {
        text,
        isUser: true,
        timestamp: new Date(),
        isTampered: false
      }
      setMessages(prev => [...prev, userMessage])

      // Use local processing only
      const startTime = Date.now()
      const response = await processMessage(text)
      setMessages(prev => [...prev, response])

      // Analyze sentiment and log the query
      const sentimentScore = analyzeSentiment(text)
      addQueryLog({
        query: text,
        timestamp: new Date(),
        sentiment: sentimentScore,
        responseTime: Date.now() - startTime
      })
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isTampered: false
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([])
    setContext({})
  }, [])

  return {
    messages,
    sendMessage,
    isProcessing,
    suggestions,
    clearChat,
  }
}
