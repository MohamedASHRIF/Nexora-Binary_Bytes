"use client"

import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { MapView } from '../components/MapView';
import { DataInsights } from '../components/DataInsights';
import { SuggestionBar } from '../components/SuggestionBar';
import { ChatHistory } from '../components/ChatHistory';
import { useGamePoints } from '../hooks/useGamePoints';
import { useDailyPromptHistory } from '../hooks/useDailyPromptHistory';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const { badges } = useGamePoints();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [homeQuestion, setHomeQuestion] = useState('');
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [recentMessages, setRecentMessages] = useState<string[]>([]);
  
  // Daily prompt history hook
  const { addPrompt } = useDailyPromptHistory();

  const handleAsk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (homeQuestion.trim() === '') return;

    // Add the prompt to daily history
    addPrompt(homeQuestion.trim());

    setInitialChatMessage(homeQuestion);
    setActiveTab('chat');
    setHomeQuestion('');
  };

  // Callback when ChatWindow finishes sending the initial message
  const handleInitialMessageSent = () => {
    setInitialChatMessage('');
  };

  // Handle recent messages change from ChatWindow
  const handleRecentMessagesChange = (messages: string[]) => {
    setRecentMessages(messages);
  };

  // Handle suggestion click - this will be passed to ChatWindow to set input
  const handleSuggestionClick = (suggestion: string) => {
    // We'll need to communicate this to the ChatWindow component
    // For now, we'll use a custom event
    const event = new CustomEvent('setChatInput', { detail: { text: suggestion } });
    window.dispatchEvent(event);
  };

  // Handle prompt click from ChatHistory
  const handleHistoryPromptClick = (prompt: string) => {
    // Add the clicked prompt to daily history
    addPrompt(prompt);
    
    // Set it as the initial message for the chat
    setInitialChatMessage(prompt);
    setActiveTab('chat');
  };

  useEffect(() => {
    setIsMounted(true);
    // Check for authentication
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }

    // Listen for map switch events from chatbot
    const handleSwitchToMap = (event: CustomEvent) => {
      console.log('Switching to map tab for location:', event.detail.location);
      setActiveTab('map');
    };

    window.addEventListener('switchToMap', handleSwitchToMap as EventListener);

    return () => {
      window.removeEventListener('switchToMap', handleSwitchToMap as EventListener);
    };
  }, [router]);

  // If not mounted yet, return null to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Fixed Navigation Bar - Below main header */}
      <nav className="fixed top-16 left-0 right-0 z-40 w-full flex items-center bg-white justify-end px-8 py-2 gap-6 border-t border-gray-100 shadow-sm">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            activeTab === 'home' ? 'bg-blue-500 text-white' : 'bg-white  text-gray-700 hover:bg-blue-100'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            activeTab === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            activeTab === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            activeTab === 'insights' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
          }`}
        >
          Insights
        </button>
      </nav>

      {/* Main Content Area - Below fixed headers */}
      <div className="flex flex-1 pt-28 min-h-0"> {/* pt-28 accounts for fixed main header (64px) + navigation height (48px) + gap */}
        {/* Chat History Sidebar - Fixed to left side when chat tab is active */}
        {activeTab === 'chat' && (
          <div className="fixed left-0 top-28 bottom-0 z-30">
            <ChatHistory onPromptClick={handleHistoryPromptClick} />
          </div>
        )}
        
        {/* Main Content Area - Adjusted for sidebar when chat is active */}
        <div className={`flex-1 flex flex-col ${activeTab === 'chat' ? 'ml-64' : ''} min-h-0`}>
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col justify-center items-center p-8">
              <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">Welcome to Nexora Campus Copilot</h1>
                <p className="text-lg text-gray-600 mb-8">Ask me anything</p>
                <form onSubmit={handleAsk} className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={homeQuestion}
                    onChange={(e) => setHomeQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Ask
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="w-full h-full flex flex-col mx-auto p-2">
              <div className="flex-1 overflow-auto">
                <ChatWindow
                  initialMessage={initialChatMessage}
                  onMessageSent={handleInitialMessageSent}
                  onRecentMessagesChange={handleRecentMessagesChange}
                  hasSidebar={true}
                />
              </div>
              <div className="flex-shrink-0">
                <SuggestionBar 
                  onSuggestionClick={handleSuggestionClick} 
                  recentMessages={recentMessages}
                />
              </div>
            </div>
          )}
          {activeTab === 'map' && (
            <div className="w-full h-full p-4">
              <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
                <MapView />
              </div>
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="w-full h-full p-4 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <DataInsights />
              </div>
            </div>
          )}
          {badges.length > 0 && activeTab === 'home' && (
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Your Badges</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {badges.map((badge) => (
                  <span
                    key={badge.id}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {badge.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
