import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVoice } from '../hooks/use-voice';
import { useChatbot } from '../hooks/use-chatbot';
import { useGamification } from '../hooks/use-gamification';
import { UserProgress } from './UserProgress';
import { DataInsights } from './DataInsights';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isListening, toggleListening, transcript } = useVoice();
  const { sendMessage, isProcessing } = useChatbot();
  const { addPoints, checkAndAwardBadges, checkAndAwardAchievements } = useGamification();

  useEffect(() => {
    setIsClient(true);
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

  // Function to render message text with clickable links
  const renderMessageText = (text: string) => {
    console.log('Rendering message text:', text); // Debug log
    
    // Check for map redirection links in the format [text](/map/location)
    // Updated regex to handle URL-encoded location names
    const mapLinkRegex = /\[([^\]]+)\]\(\/map\/([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let linkCount = 0;

    // Test the regex first
    const testMatch = mapLinkRegex.exec(text);
    console.log('Test match:', testMatch); // Debug log
    
    // Reset regex for actual processing
    mapLinkRegex.lastIndex = 0;

    while ((match = mapLinkRegex.exec(text)) !== null) {
      console.log('Found match:', match); // Debug log
      
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the clickable link
      const linkText = match[1];
      const locationPath = match[2];
      
      if (linkText && locationPath) {
        console.log('Creating button for:', linkText, '->', locationPath); // Debug log
        parts.push(
          <button
            key={`link-${linkCount++}`}
            onClick={() => {
              console.log('Navigating to:', `/map/${locationPath}`); // Debug log
              router.push(`/map/${locationPath}`);
            }}
            className="text-blue-600 hover:text-blue-800 underline font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200"
          >
            {linkText}
          </button>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    console.log('Rendered parts:', parts); // Debug log
    return parts.length > 0 ? parts : text;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const timestamp = new Date();
    const userMessage: Message = {
      id: `user-${timestamp.getTime()}`,
      text: inputText,
      sender: 'user',
      timestamp,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Award points for sending a message
    addPoints(10);
    checkAndAwardAchievements('first_query');

    // Log the query
    const startTime = Date.now();
    try {
      console.log('Sending message to chatbot...');
      let response;
      try {
        response = await sendMessage(inputText);
        console.log('=== RESPONSE RECEIVED ===');
        console.log('Response type:', typeof response);
        console.log('Response value:', response);
        console.log('ChatInterface received response:', response);
      } catch (sendError) {
        console.error('Error in sendMessage call:', sendError);
        throw sendError;
      }
      
      // Check for specific actions to award badges with comprehensive keywords
      const scheduleKeywords = ['schedule', 'class', 'classes', 'lecture', 'lectures', 'course', 'courses', 'timetable', 'timetables', 'subject', 'subjects', 'module', 'modules', 'lesson', 'lessons', 'academic', 'study', 'studies'];
      if (scheduleKeywords.some(keyword => inputText.toLowerCase().includes(keyword))) {
        checkAndAwardBadges('check_schedule_morning');
      } else if (['bus', 'transport', 'shuttle', 'route', 'timing'].some(keyword => inputText.toLowerCase().includes(keyword))) {
        checkAndAwardBadges('check_bus');
      } else if (['menu', 'food', 'cafeteria', 'canteen', 'lunch', 'breakfast', 'dinner', 'meal', 'eat', 'hungry'].some(keyword => inputText.toLowerCase().includes(keyword))) {
        checkAndAwardBadges('check_menu');
      } else if (['event', 'activity', 'program', 'fiesta', 'festival', 'celebration', 'meeting', 'conference', 'party'].some(keyword => inputText.toLowerCase().includes(keyword))) {
        checkAndAwardBadges('check_events');
      } else if (['where', 'location', 'place', 'find', 'directions', 'map', 'building', 'faculty', 'office', 'room'].some(keyword => inputText.toLowerCase().includes(keyword))) {
        checkAndAwardBadges('check_location');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-xl font-bold text-gray-800">Campus Copilot</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            {showProgress ? 'Hide Progress' : 'Show Progress'}
          </button>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            {showInsights ? 'Hide Insights' : 'Show Insights'}
          </button>
        </div>
      </div>

      {showProgress && (
        <div className="p-4 bg-white border-b">
          <UserProgress />
        </div>
      )}

      {showInsights && (
        <div className="p-4 bg-white border-b">
          <DataInsights />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">
                {message.sender === 'bot' ? renderMessageText(message.text) : message.text}
              </div>
              {isClient && (
                <div
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isProcessing}
          />
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg ${
              isListening ? 'bg-red-500' : 'bg-blue-500'
            } text-white disabled:bg-gray-400`}
            disabled={isProcessing}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? 'Stop' : 'Voice'}
          </button>
          <button
            onClick={handleSend}
            disabled={isProcessing || !inputText.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
            aria-label="Send message"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 