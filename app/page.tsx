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
// import { MoodMap } from '../components/MoodMap';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const { badges } = useGamePoints();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [homeQuestion, setHomeQuestion] = useState('');
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [recentMessages, setRecentMessages] = useState<string[]>([]);

  const { addPrompt } = useDailyPromptHistory();

  const handleAsk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (homeQuestion.trim() === '') return;
    addPrompt(homeQuestion.trim());
    setInitialChatMessage(homeQuestion);
    setActiveTab('chat');
    setHomeQuestion('');
  };

  const handleInitialMessageSent = () => {
    setInitialChatMessage('');
  };

  const handleRecentMessagesChange = (messages: string[]) => {
    setRecentMessages(messages);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const event = new CustomEvent('setChatInput', { detail: { text: suggestion } });
    window.dispatchEvent(event);
  };

  const handleHistoryPromptClick = (prompt: string) => {
    addPrompt(prompt);
    setInitialChatMessage(prompt);
    setActiveTab('chat');
  };

  useEffect(() => {
    setIsMounted(true);
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }

    const handleSwitchToMap = (event: CustomEvent) => {
      console.log('Switching to map tab for location:', event.detail.location);
      setActiveTab('map');
    };

    window.addEventListener('switchToMap', handleSwitchToMap as EventListener);
    return () => {
      window.removeEventListener('switchToMap', handleSwitchToMap as EventListener);
    };
  }, [router]);

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-slate-900">
      <nav className="fixed top-16 left-0 right-0 z-40 w-full flex items-center bg-white dark:bg-slate-800 justify-end px-8 py-2 gap-6 border-t border-gray-100 dark:border-slate-700 shadow-sm">
        {['home', 'chat', 'map', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 pt-28 min-h-0">
        {activeTab === 'chat' && (
          <div className="fixed left-0 top-28 bottom-0 z-30">
            <ChatHistory onPromptClick={handleHistoryPromptClick} />
          </div>
        )}

        <div className={`flex-1 flex flex-col ${activeTab === 'chat' ? 'ml-64' : ''} min-h-0`}>
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col justify-center items-center p-8">
              <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to Nexora Campus Copilot</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Ask me anything</p>
                <form onSubmit={handleAsk} className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={homeQuestion}
                    onChange={(e) => setHomeQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition"
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
              <div className="w-full h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <MapView />
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="w-full h-full p-4 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <DataInsights />
                {/* 🧠 Only show MoodMap if there's data */}
                {/* <MoodMap /> */}
              </div>
            </div>
          )}

          {badges.length > 0 && activeTab === 'home' && (
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Your Badges</h3>
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
