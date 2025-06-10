import React, { useState, useRef, useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useChatbot } from '../hooks/use-chatbot';
import { useGamePoints } from '../hooks/useGamePoints';
import { useLanguage } from '../hooks/useLanguage';
import type { Message } from '@/types';


interface ChatWindowProps {
  initialMessage?: string;
  onMessageSent?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialMessage, onMessageSent }) => {
  const [inputText, setInputText] = useState('');
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, startListening, stopListening, transcript } = useVoiceInput();
  const { messages, isProcessing, sendMessage, suggestions, clearChat } = useChatbot();
  const { addPoints } = useGamePoints();
  const { translate } = useLanguage();


  useEffect(() => {
    setMounted(true);
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
    // Send initialMessage once when it arrives
    useEffect(() => {
      if (initialMessage && initialMessage.trim()) {
        (async () => {
          addPoints(5);
          await sendMessage(initialMessage);
          onMessageSent?.();
        })();
      }
    }, [initialMessage, sendMessage, addPoints, onMessageSent]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    addPoints(5);
    await sendMessage(inputText);
    setInputText('');
  };

  const handleClearChat = async () => {
    await clearChat();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full" suppressHydrationWarning>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    ? 'bg-blue-500 text-white whitespace-nowrap'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.text}
              </div>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`p-2 rounded-lg ${
              isListening ? 'bg-red-500' : 'bg-blue-500'
            } text-white`}
          >
            {isListening ? 'Stop' : 'Voice'}
          </button>
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
          >
            Send
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            title="Clear chat history"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}; 