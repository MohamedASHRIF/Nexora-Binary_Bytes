"use client"

import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { MapView } from '../components/MapView';
import { DataInsights } from '../components/DataInsights';
import { SuggestionBar } from '../components/SuggestionBar';
import { useGamePoints } from '../hooks/useGamePoints';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';



function ChatHistory() {
  return (
    <div className="w-64 flex-shrink-0 bg-gray-50 border-r p-4 flex flex-col">
    <h2 className="text-lg font-semibold mb-4">Chat History</h2>
    <div className="text-gray-400 flex-grow flex items-center justify-center">No chat history yet.</div>
  </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const { badges } = useGamePoints();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
   const [homeQuestion, setHomeQuestion] = useState('');
   const [initialChatMessage, setInitialChatMessage] = useState('');
   const [recentMessages, setRecentMessages] = useState<string[]>([]);


   const handleAsk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (homeQuestion.trim() === '') return;

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
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="w-full flex items-center bg-white justify-end px-8 py-2 gap-6">
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
      {/* Main Content + Chat History Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Chat History Sidebar */}
        {activeTab === 'chat' && (
          
            <ChatHistory />
         
        )}
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col justify-center items-center  ${activeTab === 'chat' ? 'pl-0' : ''} min-h-0`}>
          {activeTab === 'home' && (
             <div className="text-center ">
                              <h1 className="text-4xl font-bold mb-4">Welcome to Nexora Campus Copilot</h1>

             <p className="text-lg text-gray-600 mb-8">Ask me anything</p>
             <form onSubmit={handleAsk} className="flex gap-2">
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
          )}
          {activeTab === 'chat' && (
            <div className="w-full h-full flex flex-col  mx-auto p-2 ">
              <div className="flex-1 overflow-auto">
              <ChatWindow
                initialMessage={initialChatMessage}
                onMessageSent={handleInitialMessageSent}
                onRecentMessagesChange={handleRecentMessagesChange}
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
            <div className="w-full h-full max-w-3xl mx-auto">
              <MapView />
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="w-full h-full max-w-3xl mx-auto">
              <DataInsights />
            </div>
          )}
          {badges.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Your Badges</h3>
              <div className="flex flex-wrap gap-2">
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
    </main>
  );
}
