"use client"

import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { MapView } from '../components/MapView';
import { DataInsights } from '../components/DataInsights';
import { SuggestionBar } from '../components/SuggestionBar';
import { useGamePoints } from '../hooks/useGamePoints';
import Header from './components/Header';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';


function ChatHistory() {
  return (
    <div className="w-64 h-full bg-gray-50 border-r p-4">
      <h2 className="text-lg font-semibold mb-4">Chat History</h2>

      <div className="text-gray-400">No chat history yet.</div>
    </div>
  );
}

export default function Home() {

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { badges, points } = useGamePoints();

  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // Check for authentication
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Component */}
      <Header />
      {/* New Navigation Bar */}
      <nav className="w-full bg-white shadow flex items-center px-8 py-2 gap-6">
        <button
          onClick={() => setActiveTab(null)}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            activeTab === null ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
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
      {/* Main Content + Left Sidebar */}
      <div className="flex flex-1">
        {/* Left Sidebar for Chat History */}
        {activeTab === 'chat' && <ChatHistory />}
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col justify-center items-center p-8 ${activeTab === 'chat' ? 'pl-0' : ''}`}>
          {activeTab === null && (
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to Nexora Campus Copilot</h1>
              <p className="text-lg text-gray-600 mb-8">Select an option from the navigation bar to get started!</p>
              {/* You can add more welcome content or images here */}
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="w-full h-full flex flex-col max-w-3xl mx-auto">
              <div className="flex-1 overflow-hidden">
                <ChatWindow />
              </div>
              <div className="flex-shrink-0">
                <SuggestionBar onSuggestionClick={() => {}} />
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
