"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useChatbot } from '../hooks/use-chatbot';
import { useGamePoints } from '../hooks/useGamePoints';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { ChatClassSchedule } from './ChatClassSchedule';
import { ChatBusSchedule } from './ChatBusSchedule';
import { ChatEvents } from './ChatEvents';
import type { Message } from '@/types';
import { getBusData, getEventData } from '../lib/data';
import Cookies from 'js-cookie';
import { FaUserCircle } from 'react-icons/fa';
import { BsRobot } from 'react-icons/bs';

const API_BASE_URL = 'http://localhost:5000/api'; // Backend server URL

interface ChatWindowProps {
  initialMessage?: string;
  onMessageSent?: () => void;
  onRecentMessagesChange?: (messages: string[]) => void;
  hasSidebar?: boolean;
}

// Add type for canteen menu
interface CanteenMenu {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

interface Canteen {
  id: string;
  name: string;
  foodType: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialMessage, onMessageSent, onRecentMessagesChange, hasSidebar = false }) => {
  const [inputText, setInputText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [recentUserMessages, setRecentUserMessages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, startListening, stopListening, transcript } = useVoiceInput();
  const { messages, isProcessing, sendMessage, suggestions, clearChat, setMessages } = useChatbot();
  const { addPoints } = useGamePoints();
  const { language, setLanguage, translate } = useLanguage();
  const router = useRouter();
  const initialMessageSentRef = useRef(false);
  const [busData, setBusData] = useState<any>(null);
  const [eventsData, setEventsData] = useState<any>(null);
  const [availableCanteens, setAvailableCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [canteenMenu, setCanteenMenu] = useState<CanteenMenu | null>(null);
  const [showCanteenTable, setShowCanteenTable] = useState(false);
  const [canteenLoading, setCanteenLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [canteenError, setCanteenError] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizList, setQuizList] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [quizResult, setQuizResult] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  // Helper: detect boredom
  const isBoredMessage = (text: string) => {
    // Matches 'bore', 'bored', 'boring', etc. anywhere in the message
    return /bore|bored|boring|nothing to do|dull|tired|not fun|no fun|uninteresting|monotonous|tedious|drowsy|sleepy|lazy|inactive|unexciting|unamusing|unhappy|sad|depressed|down|blue|meh/i.test(text);
  };

  // Helper: detect yes
  const isYesMessage = (text: string) => {
    const yesKeywords = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'yup', 'let\'s play', 'play', 'why not', 'of course'];
    const lower = text.toLowerCase();
    return yesKeywords.some((kw) => lower.includes(kw));
  };

  // State to track if we are waiting for play confirmation
  const [awaitingPlayConfirm, setAwaitingPlayConfirm] = useState(false);

  // Language options
  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];

  // Add a typing indicator state
  const [showTyping, setShowTyping] = useState(false);

  // Show typing indicator when isProcessing is true
  useEffect(() => {
    setShowTyping(isProcessing);
  }, [isProcessing]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for suggestion clicks to set input text
  useEffect(() => {
    const handleSetChatInput = (event: CustomEvent) => {
      setInputText(event.detail.text);
    };

    window.addEventListener('setChatInput', handleSetChatInput as EventListener);

    return () => {
      window.removeEventListener('setChatInput', handleSetChatInput as EventListener);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      (async () => {
        addPoints(5);
        await sendMessage(initialMessage);
        onMessageSent?.();
      })();
    }
    if (!initialMessage) {
      initialMessageSentRef.current = false;
    }
  }, [initialMessage, sendMessage, addPoints, onMessageSent]);

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busResponse, eventsResponse] = await Promise.all([
          getBusData(),
          getEventData()
        ]);
        setBusData(busResponse);
        setEventsData(eventsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch available canteens when needed
  useEffect(() => {
    if (showCanteenTable && !selectedCanteen) {
      setCanteenLoading(true);
      setCanteenError(null);
      fetch(`${API_BASE_URL}/cafeteria/menu`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          const canteens = data.data.menus.map((m: any, idx: number) => ({
            id: m.canteenName,
            name: m.canteenName,
            foodType: m.foodType || 'N/A',
          }));
          setAvailableCanteens(canteens);
          setCanteenLoading(false);
        })
        .catch(err => {
          setCanteenError('Failed to fetch canteens');
          setCanteenLoading(false);
        });
    }
  }, [showCanteenTable, selectedCanteen]);

  // Fetch menu for selected canteen
  useEffect(() => {
    if (showCanteenTable && selectedCanteen) {
      setMenuLoading(true);
      setMenuError(null);
      fetch(`${API_BASE_URL}/cafeteria/menu/${selectedCanteen}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          setCanteenMenu(data.data.menu.meals);
          setMenuLoading(false);
        })
        .catch(err => {
          setMenuError('Failed to fetch menu');
          setMenuLoading(false);
        });
    }
  }, [showCanteenTable, selectedCanteen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // If canteen table is open and user sends a new message, close the table
    if (showCanteenTable && !selectedCanteen) {
      setShowCanteenTable(false);
      setSelectedCanteen(null);
      setCanteenMenu(null);
    }

    // Boredom/game logic - DISABLED to prevent duplicate responses
    // Let the backend handle boredom detection and game suggestions
    /*
    if (!awaitingPlayConfirm && isBoredMessage(inputText)) {
      setMessages(prev => [
        ...prev,
        { text: inputText, isUser: true, timestamp: new Date(), isTampered: false },
        { text: "You seem bored! Would you like to play Tic-Tac-Toe? (yes/no)", isUser: false, timestamp: new Date(), isTampered: false }
      ]);
      setAwaitingPlayConfirm(true);
      setInputText('');
      
      // Also save to backend for persistence
      addPoints(5);
      await sendMessage(inputText);
      return;
    }
    if (awaitingPlayConfirm && isYesMessage(inputText)) {
      setMessages(prev => [
        ...prev,
        { text: inputText, isUser: true, timestamp: new Date(), isTampered: false },
        { text: "Great! Taking you to the game...", isUser: false, timestamp: new Date(), isTampered: false }
      ]);
      // Save messages to backend before redirecting
      setAwaitingPlayConfirm(false);
      setInputText('');
      
      // Also save to backend for persistence
      addPoints(5);
      await sendMessage(inputText);
      
      // Small delay to ensure messages are saved
      setTimeout(() => {
        router.push('/game');
      }, 500);
      return;
    }
    if (awaitingPlayConfirm && !isYesMessage(inputText)) {
      setMessages(prev => [
        ...prev,
        { text: inputText, isUser: true, timestamp: new Date(), isTampered: false },
        { text: "No problem! Let me know if you change your mind.", isUser: false, timestamp: new Date(), isTampered: false }
      ]);
      setAwaitingPlayConfirm(false);
      setInputText('');
      
      // Also save to backend for persistence
      addPoints(5);
      await sendMessage(inputText);
      return;
    }
    */

    // Always add the user message to the chat
    setMessages(prev => [
      ...prev,
      {
        text: inputText,
        isUser: true,
        timestamp: new Date(),
        isTampered: false
      }
    ]);

    const newRecentMessages = [...recentUserMessages, inputText].slice(-5); // Keep last 5 messages
    setRecentUserMessages(newRecentMessages);
    onRecentMessagesChange?.(newRecentMessages);

    addPoints(5);
    const response = await sendMessage(inputText);
    setInputText('');

    // Intercept SHOW_CANTEEN_TABLE signal from backend
    if (response && response.data === 'SHOW_CANTEEN_TABLE') {
      setShowCanteenTable(true);
      setSelectedCanteen(null);
      setCanteenMenu(null);
      return;
    }
  };

  const handleClearChat = () => {
    setInputText('');
    setRecentUserMessages([]);
    if (typeof setMessages === 'function') {
      setMessages([]);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'en' | 'si' | 'ta');
  };

  const getPlaceholderText = () => {
    switch (language) {
      case 'si':
        return 'ඔබේ පණිවිඩය ටයිප් කරන්න...';
      case 'ta':
        return 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...';
      default:
        return 'Type your message...';
    }
  };

  const getVoiceButtonText = () => {
    if (isListening) {
      switch (language) {
        case 'si':
          return 'නවත්වන්න';
        case 'ta':
          return 'நிறுத்து';
        default:
          return 'Stop';
      }
    } else {
      switch (language) {
        case 'si':
          return 'හඬ';
        case 'ta':
          return 'குரல்';
        default:
          return 'Voice';
      }
    }
  };

  const getSendButtonText = () => {
    switch (language) {
      case 'si':
        return 'යවන්න';
      case 'ta':
        return 'அனுப்பு';
      default:
        return 'Send';
    }
  };

  const getClearButtonText = () => {
    switch (language) {
      case 'si':
        return 'මකන්න';
      case 'ta':
        return 'அழி';
      default:
        return 'Clear';
    }
  };

  const getQuizButtonText = () => {
    switch (language) {
      case 'si':
        return 'ප්‍රශ්නාවලිය';
      case 'ta':
        return 'வினாடி வினா';
      default:
        return 'Quiz';
    }
  };

  const handleQuiz = async () => {
    setQuizLoading(true);
    setShowQuiz(true);
    try {
      const res = await fetch(`${API_BASE_URL}/quiz`, {
        headers: (() => {
          const token = localStorage.getItem('token') || Cookies.get('token');
          let headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          return headers;
        })(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setQuizList(data.data);
        setQuizIndex(0);
        setQuizSelected('');
        setQuizScore(0);
        setQuizResult(false);
      }
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizSelect = (option: string) => setQuizSelected(option);
  const handleQuizNext = () => {
    const quiz = quizList[quizIndex];
    const correct = quiz.questions[0]?.options[quiz.questions[0]?.correctAnswer];
    if (quizSelected === correct) setQuizScore(quizScore + 1);
    setQuizSelected('');
    if (quizIndex + 1 < quizList.length) {
      setQuizIndex(quizIndex + 1);
    } else {
      setQuizResult(true);
    }
  };
  const handleQuizClose = () => setShowQuiz(false);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative h-full w-full">
      {/* Watermark background - fixed to chat window, not scrollable */}
      <div className="pointer-events-none select-none z-0 absolute inset-0 flex items-center justify-center">
        <span className="text-[7vw] font-extrabold text-blue-300 dark:text-blue-900 opacity-20 tracking-widest" style={{letterSpacing: '0.15em', userSelect: 'none', textShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          NEXORA
            </span>
      </div>
      {/* Chat content (messages, input, etc.) in a relative z-10 container */}
      <div className="relative z-10 flex flex-col h-full">
      {/* Messages Area - Scrollable within chat container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 pb-28">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {translate('welcome')}
          </div>
        )}
        {messages.map((message, index) => {
          // Check if message contains class schedule data - look for general pattern
          const isClassSchedule = !message.isUser && 
                                 message.text.includes('remaining') && 
                                 message.text.includes('classes') && 
                                 message.text.includes('for today') &&
                                 message.text.includes('with') && // Indicates instructor format
                                 message.text.includes('to'); // Indicates time range
          
          // Check if message contains bus schedule data - make detection extremely specific
          const isBusSchedule = !message.isUser && 
                               message.text.includes('bus') && 
                               message.text.includes('available') && 
                               message.text.includes('routes') &&
                               (message.text.includes('Route') || message.text.includes('route')) &&
                               (message.text.includes('Duration:') || message.text.includes('Schedule:'));
          
          // Check if message contains events data - make detection more specific
          const isEvents = !message.isUser && 
                          message.text.includes('upcoming events') &&
                          message.text.includes('Date:') &&
                          message.text.includes('Time:') &&
                          message.text.includes('Location:');
          
          // Extract class data if it's a class schedule message
          let classScheduleData = null;
          if (isClassSchedule) {
            try {
              // Parse the class schedule from the chatbot response
              const lines = message.text.split('\n');
              const classes = [];
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                // Look for lines that start with "- " and contain time, class name, location, and instructor
                if (trimmedLine.startsWith('- ') && trimmedLine.includes('to') && trimmedLine.includes('with')) {
                  // Extract time range (e.g., "15:00 to 17:30")
                  const timeMatch = trimmedLine.match(/(\d{1,2}:\d{2})\s+to\s+(\d{1,2}:\d{2})/);
                  if (timeMatch) {
                    const startTime = timeMatch[1];
                    const endTime = timeMatch[2];
                    
                    // Extract class name (between time and location)
                    const timeEndIndex = trimmedLine.indexOf('to') + 2;
                    const withIndex = trimmedLine.indexOf('with');
                    const locationStartIndex = trimmedLine.lastIndexOf('(');
                    const locationEndIndex = trimmedLine.lastIndexOf(')');
                    
                    if (timeEndIndex > 0 && withIndex > timeEndIndex && locationStartIndex > timeEndIndex && locationEndIndex > locationStartIndex) {
                      const classInfo = trimmedLine.substring(timeEndIndex, locationStartIndex).trim();
                      const location = trimmedLine.substring(locationStartIndex + 1, locationEndIndex).trim();
                      const instructor = trimmedLine.substring(withIndex + 4).trim();
                      
                      // Calculate duration
                      const start = new Date(`2000-01-01T${startTime}:00`);
                      const end = new Date(`2000-01-01T${endTime}:00`);
                      const durationMs = end.getTime() - start.getTime();
                      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                      const duration = durationHours > 0 ? `${durationHours}h ${durationMinutes}m` : `${durationMinutes}m`;
                      
                      classes.push({
                        time: startTime,
                        subject: classInfo,
                        location: location,
                        instructor: instructor,
                        duration: duration
                      });
                    }
                  }
                }
              }
              
              if (classes.length > 0) {
                classScheduleData = classes;
              }
            } catch (error) {
              console.error('Error parsing class schedule from chatbot response:', error);
            }
          }

          // Extract bus data if it's a bus schedule message - use real data from database
          let busScheduleData = null;
          if (isBusSchedule && busData) {
            busScheduleData = busData.nextBuses.map((bus: any, idx: number) => ({
              time: bus.time,
              route: bus.route,
              destination: bus.destination,
              platform: `P${idx + 1}`,
              capacity: "45 seats",
              status: idx === 0 ? "on-time" as const : "scheduled" as const
            }));
          }

          // Extract events data if it's an events message - parse from chatbot response
          let eventsDisplayData = null;
          if (isEvents) {
            try {
              // Parse the events from the chatbot response
              const lines = message.text.split('\n');
              const events = [];
              let currentEvent = null;
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.includes('upcoming events') && !trimmedLine.includes('Here are the')) {
                  if (!trimmedLine.startsWith('Date:') && !trimmedLine.startsWith('Time:') && !trimmedLine.startsWith('Location:')) {
                    // This is an event title
                    if (currentEvent) {
                      events.push(currentEvent);
                    }
                    currentEvent = {
                      title: trimmedLine,
                      date: '',
                      time: '',
                      location: '',
                      description: '',
                      attendees: Math.floor(Math.random() * 50) + 10,
                      category: 'academic' as const,
                      priority: 'medium' as const
                    };
                  } else if (trimmedLine.startsWith('Date:')) {
                    if (currentEvent) {
                      currentEvent.date = trimmedLine.replace('Date:', '').trim();
                    }
                  } else if (trimmedLine.startsWith('Time:')) {
                    if (currentEvent) {
                      currentEvent.time = trimmedLine.replace('Time:', '').trim();
                    }
                  } else if (trimmedLine.startsWith('Location:')) {
                    if (currentEvent) {
                      currentEvent.location = trimmedLine.replace('Location:', '').trim();
                      currentEvent.description = `Event at ${currentEvent.location}`;
                    }
                  }
                }
              }
              
              // Add the last event if exists
              if (currentEvent) {
                events.push(currentEvent);
              }
              
              if (events.length > 0) {
                eventsDisplayData = events.map((event, idx) => ({
                  ...event,
                  category: idx % 3 === 0 ? "academic" as const : 
                           idx % 3 === 1 ? "cultural" as const : "workshop" as const,
                  priority: idx === 0 ? "high" as const : 
                           idx === 1 ? "medium" as const : "low" as const
                }));
              }
            } catch (error) {
              console.error('Error parsing events from chatbot response:', error);
            }
          }

            // Render visually appealing module list if message is a module list
            if (!message.isUser && typeof message.text === 'string' && message.text.startsWith('MODULE_LIST:')) {
              const modules = message.text.replace('MODULE_LIST:', '').split('|');
              return (
                <div className="w-full flex justify-start" key={index}>
                  <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg shadow-md p-4 mt-2 max-w-xl w-full">
                    <h3 className="font-semibold text-lg mb-2 text-blue-700 dark:text-blue-300">Your Degree Modules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modules.map((mod, idx) => (
                        <div key={idx} className="bg-blue-50 dark:bg-blue-900 rounded px-3 py-2 text-blue-900 dark:text-blue-100 font-medium shadow-sm">
                          {mod}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (isClassSchedule && classScheduleData) {
          return (
                <div key={index} className="flex justify-start mb-2">
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <BsRobot className="h-8 w-8 text-gray-700 bg-gray-100 dark:bg-slate-700 rounded-full shadow flex-shrink-0" />
                  <div className="max-w-md">
                    <ChatClassSchedule classes={classScheduleData} />
                    </div>
                  </div>
                </div>
              );
            }
            if (isBusSchedule && busScheduleData) {
              return (
                <div key={index} className="flex justify-start mb-2">
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <BsRobot className="h-8 w-8 text-gray-700 bg-gray-100 dark:bg-slate-700 rounded-full shadow flex-shrink-0" />
                  <div className="max-w-md">
                    <ChatBusSchedule buses={busScheduleData} />
                    </div>
                  </div>
                </div>
              );
            }
            if (isEvents && eventsDisplayData) {
              return (
                <div key={index} className="flex justify-start mb-2">
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <BsRobot className="h-8 w-8 text-gray-700 bg-gray-100 dark:bg-slate-700 rounded-full shadow flex-shrink-0" />
                  <div className="max-w-md">
                    <ChatEvents events={eventsDisplayData} />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0">
                    {message.isUser ? (
                      <FaUserCircle className="h-8 w-8 text-blue-500 bg-white rounded-full shadow" />
                    ) : (
                      <BsRobot className="h-8 w-8 text-gray-700 bg-gray-100 dark:bg-slate-700 rounded-full shadow" />
                    )}
                  </div>
                  {/* Message bubble */}
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-md relative ${
                      message.isUser
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-bl-none border-l-4 border-blue-400'
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {message.text}
                    </div>
                    {/* Timestamp */}
                    <div className="text-xs text-gray-400 mt-1 ml-1 select-none">
                      {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {showTyping && (
            <div className="flex justify-start mb-2">
              <div className="flex items-end gap-2 max-w-[80%]">
                <BsRobot className="h-8 w-8 text-gray-700 bg-gray-100 dark:bg-slate-700 rounded-full shadow flex-shrink-0" />
                <div>
                  <div className="rounded-2xl px-4 py-2 shadow-md relative bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-bl-none border-l-4 border-blue-400 flex items-center gap-2">
                    <span className="italic animate-pulse">Nexora is typing...</span>
                    <svg className="animate-spin h-5 w-5 text-blue-400 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showCanteenTable && !selectedCanteen && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4 w-full max-w-2xl mt-2">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Available Canteens</h3>
                {canteenLoading ? (
                  <div className="text-gray-700 dark:text-gray-200">Loading canteens...</div>
                ) : canteenError ? (
                  <div className="text-red-500">{canteenError}</div>
                ) : (
                  <div className="space-y-2">
                    {availableCanteens.map((canteen) => (
                      <div key={canteen.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 rounded-lg px-4 py-2 shadow-sm">
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{canteen.name}</span>
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => { setSelectedCanteen(canteen.id); setCanteenMenu(null); }}
                        >
                          View Menu
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="mt-3 bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-1 rounded hover:bg-red-300 dark:hover:bg-red-800"
                  onClick={() => {
                    setShowCanteenTable(false);
                    setSelectedCanteen(null);
                    setCanteenMenu(null);
                  }}
                >
                  Exit
                </button>
              </div>
            </div>
          )}
          {showCanteenTable && selectedCanteen && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4 w-full max-w-2xl mt-2">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{availableCanteens.find(c => c.id === selectedCanteen)?.name} Menu</h3>
                {menuLoading ? (
                  <div className="text-gray-700 dark:text-gray-200">Loading menu...</div>
                ) : menuError ? (
                  <div className="text-red-500">{menuError}</div>
                ) : canteenMenu ? (
                  <table className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100">Meal</th>
                        <th className="px-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white dark:bg-slate-900">
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 font-medium">Breakfast</td>
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100">{canteenMenu.breakfast.join(', ')}</td>
                      </tr>
                      <tr className="bg-white dark:bg-slate-900">
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 font-medium">Lunch</td>
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100">{canteenMenu.lunch.join(', ')}</td>
                      </tr>
                      <tr className="bg-white dark:bg-slate-900">
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 font-medium">Dinner</td>
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100">{canteenMenu.dinner.join(', ')}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : null}
                <button
                  className="mt-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-slate-600"
                  onClick={() => { setSelectedCanteen(null); setCanteenMenu(null); }}
                >
                  Back to Canteens
                </button>
                <button
                  className="mt-3 ml-2 bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-1 rounded hover:bg-red-300 dark:hover:bg-red-800"
                  onClick={() => {
                    setShowCanteenTable(false);
                    setSelectedCanteen(null);
                    setCanteenMenu(null);
                  }}
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar - Fixed to bottom */}
      <div className="absolute bottom-0 left-0 w-full z-10 border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 shadow-lg">
        {/* Frequently typed messages */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            "What's the weather like?",
            "Show me my schedule",
            "Where is the library?",
            "What's for lunch?",
            "Help me with homework",
            "Tell me a joke"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputText(suggestion)}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex space-x-2 max-w-full">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={getPlaceholderText()}
            className="flex-1 p-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`p-2 rounded-lg ${
              isListening ? 'bg-red-500 dark:bg-red-600' : 'bg-blue-500 dark:bg-blue-600'
            } text-white min-w-[60px]`}
            title={language === 'en' ? 'Voice input' : language === 'si' ? 'හඬ ඇතුළත් කිරීම' : 'குரல் உள்ளீடு'}
          >
            {getVoiceButtonText()}
          </button>
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg disabled:bg-gray-400 dark:disabled:bg-slate-600 min-w-[60px]"
          >
            {getSendButtonText()}
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 bg-gray-500 dark:bg-slate-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-slate-700 min-w-[60px]"
            title={language === 'en' ? 'Clear chat history' : language === 'si' ? 'චැට් ඉතිහාසය මකන්න' : 'அரட்டை வரலாற்றை அழி'}
          >
            {getClearButtonText()}
          </button>
            <button
              onClick={handleQuiz}
              className="p-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 min-w-[60px]"
              title={language === 'en' ? 'Take a quiz' : language === 'si' ? 'ප්‍රශ්නාවලියක් කරන්න' : 'வினாடி வினா'}
            >
              {getQuizButtonText()}
            </button>
          </div>
        </div>
        {/* Quiz Modal - only render once here */}
        {showQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md relative">
              <button onClick={handleQuizClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✖</button>
              {quizLoading ? (
                <div>Loading quiz...</div>
              ) : quizResult ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">Quiz Result</h2>
                  <p className="mb-2">Your score: {quizScore} / {quizList.length}</p>
                  <button className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-2 mt-2 text-white" onClick={handleQuizClose}>Close</button>
                </div>
              ) : quizList.length > 0 ? (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Q{quizIndex + 1}: {quizList[quizIndex].questions[0]?.question || quizList[quizIndex].title}</h2>
                  <div className="flex flex-col gap-2 mb-4">
                    {quizList[quizIndex].questions[0]?.options.map((opt: string, idx: number) => (
                      <label key={idx} className={`p-2 rounded cursor-pointer ${quizSelected === opt ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}> 
                        <input
                          type="radio"
                          name="quizOption"
                          value={opt}
                          checked={quizSelected === opt}
                          onChange={() => handleQuizSelect(opt)}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleQuizNext}
                    className="bg-green-600 hover:bg-green-700 rounded px-3 py-2 mt-2 text-white"
                    disabled={!quizSelected}
                  >
                    {quizIndex + 1 === quizList.length ? 'Finish' : 'Next'}
                  </button>
                </div>
              ) : (
                <div>No quizzes available.</div>
              )}
            </div>
          </div>
        )}
      </div>
      {showTyping && (
        <div className="absolute right-4 bottom-24 z-20">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded shadow border border-blue-200 dark:border-blue-700">
            <BsRobot className="h-5 w-5 text-blue-400 animate-bounce" />
            <span className="text-gray-700 dark:text-gray-200 italic animate-pulse">Nexora is typing...</span>
            <svg className="animate-spin h-4 w-4 text-blue-400 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}; 