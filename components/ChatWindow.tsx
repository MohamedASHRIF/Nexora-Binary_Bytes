import React, { useState, useRef, useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useChatbot } from '../hooks/use-chatbot';
import { useGamePoints } from '../hooks/useGamePoints';
import { useLanguage } from '../hooks/useLanguage';
import { useDailyPromptHistory } from '../hooks/useDailyPromptHistory';
import type { Message } from '@/types';


interface ChatWindowProps {
  initialMessage?: string;
  onMessageSent?: () => void;
  onRecentMessagesChange?: (messages: string[]) => void;
  hasSidebar?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialMessage, onMessageSent, onRecentMessagesChange, hasSidebar = false }) => {
  const [inputText, setInputText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [recentUserMessages, setRecentUserMessages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, startListening, stopListening, transcript } = useVoiceInput();
  const { messages, isProcessing, sendMessage, suggestions, clearChat } = useChatbot();
  const { addPoints } = useGamePoints();
  const { language, setLanguage, translate } = useLanguage();
  const { addPrompt } = useDailyPromptHistory();
  const initialMessageSentRef = useRef(false);

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
        // Save the initial message to daily history
        addPrompt(initialMessage.trim());
        await sendMessage(initialMessage);
        onMessageSent?.();
      })();
    }
    if (!initialMessage) {
      initialMessageSentRef.current = false;
    }
  }, [initialMessage, sendMessage, addPoints, onMessageSent, addPrompt]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add the message to recent messages
    const newRecentMessages = [...recentUserMessages, inputText].slice(-5); // Keep last 5 messages
    setRecentUserMessages(newRecentMessages);
    onRecentMessagesChange?.(newRecentMessages);

    // Save the prompt to daily history
    addPrompt(inputText.trim());

    addPoints(5);
    await sendMessage(inputText);
    setInputText('');
  };

  const handleClearChat = async () => {
    await clearChat();
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
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {language === 'en' ? 'Language' : language === 'si' ? 'භාෂාව' : 'மொழி'}:
            </span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.flag} {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-500">
            {language === 'en' ? 'Current' : language === 'si' ? 'වර්තමාන' : 'தற்போதைய'}: {languageOptions.find(opt => opt.code === language)?.name}
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable within chat container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {messages.length === 0 && (
          <div className="text-center text-gray-500">
            {translate('welcome')}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp.getTime()}-${index}`}
            className={`flex ${
              message.isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="flex flex-col">
              <div
                className={`max-w-full rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={{ wordBreak: 'break-word' }}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar - Fixed at bottom of viewport (laptop screen) */}
      <div className={`fixed bottom-0 border-t border-gray-200 p-4 bg-white shadow-lg z-50 ${hasSidebar ? 'left-64 right-0' : 'left-0 right-0'}`}>
        <div className="flex space-x-2 max-w-full">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={getPlaceholderText()}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`p-2 rounded-lg ${
              isListening ? 'bg-red-500' : 'bg-blue-500'
            } text-white min-w-[60px]`}
            title={language === 'en' ? 'Voice input' : language === 'si' ? 'හඬ ඇතුළත් කිරීම' : 'குரல் உள்ளீடு'}
          >
            {getVoiceButtonText()}
          </button>
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 min-w-[60px]"
          >
            {getSendButtonText()}
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 min-w-[60px]"
            title={language === 'en' ? 'Clear chat history' : language === 'si' ? 'චැට් ඉතිහාසය මකන්න' : 'அரட்டை வரலாற்றை அழி'}
          >
            {getClearButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}; 