"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useChatbot } from '../hooks/use-chatbot';
import { useGamePoints } from '../hooks/useGamePoints';
import { useLanguage } from '../hooks/useLanguage';
import { ChatClassSchedule } from './ChatClassSchedule';
import { ChatBusSchedule } from './ChatBusSchedule';
import { ChatEvents } from './ChatEvents';
import type { Message } from '@/types';
import { getBusData, getEventData } from '../lib/data';

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

  // Language options
  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];

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
    const lower = inputText.toLowerCase();
    if (lower.includes('food') || lower.includes('hungry') || lower.includes('canteen')) {
      setShowCanteenTable(true);
      setSelectedCanteen(null);
      setCanteenMenu(null);
      setInputText('');
      return;
    }

    // Add the message to recent messages
    const newRecentMessages = [...recentUserMessages, inputText].slice(-5); // Keep last 5 messages
    setRecentUserMessages(newRecentMessages);
    onRecentMessagesChange?.(newRecentMessages);

    addPoints(5);
    await sendMessage(inputText);
    setInputText('');
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full" suppressHydrationWarning>
      {/* Language Selector */}
      <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Language' : language === 'si' ? 'භාෂාව' : 'மொழி'}:
            </span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.flag} {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'en' ? 'Current' : language === 'si' ? 'වර්තමාන' : 'தற்போதைய'}: {languageOptions.find(opt => opt.code === language)?.name}
          </div>
        </div>
      </div>

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

          return (
            <div
              key={`${message.timestamp.getTime()}-${index}`}
              className={`flex ${
                message.isUser ? 'justify-end' : 'justify-start'
              } mb-1`}
            >
              <div className="flex flex-col max-w-full">
                {isClassSchedule && classScheduleData ? (
                  // Render class schedule component
                  <div className="max-w-md">
                    <ChatClassSchedule classes={classScheduleData} />
                  </div>
                ) : isBusSchedule && busScheduleData ? (
                  // Render bus schedule component
                  <div className="max-w-md">
                    <ChatBusSchedule buses={busScheduleData} />
                  </div>
                ) : isEvents && eventsDisplayData ? (
                  // Render events component
                  <div className="max-w-md">
                    <ChatEvents events={eventsDisplayData} />
                  </div>
                ) : (
                  // Render regular text message
                  <div
                    className={`max-w-full rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {showCanteenTable && !selectedCanteen && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4 w-full max-w-2xl mt-2">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Available Canteens</h3>
              {canteenLoading ? (
                <div className="text-gray-700 dark:text-gray-200">Loading canteens...</div>
              ) : canteenError ? (
                <div className="text-red-500">{canteenError}</div>
              ) : (
                <table className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100">Canteen</th>
                      <th className="px-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableCanteens.map((canteen) => (
                      <tr key={canteen.id} className="bg-white dark:bg-slate-900">
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 font-medium">{canteen.name}</td>
                        <td className="px-4 py-2 border border-gray-200 dark:border-slate-700">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => { setSelectedCanteen(canteen.id); setCanteenMenu(null); }}
                          >
                            View Menu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      {/* Input Bar - Fixed at bottom of viewport (laptop screen) */}
      <div className={`fixed bottom-0 border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 shadow-lg z-50 ${hasSidebar ? 'left-64 right-0' : 'left-0 right-0'}`}>
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
        </div>
      </div>
    </div>
  );
}; 