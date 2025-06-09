"use client"

import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { MapView } from '../components/MapView';
import { DataInsights } from '../components/DataInsights';
import { SuggestionBar } from '../components/SuggestionBar';
import { useGamePoints } from '../hooks/useGamePoints';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const { points, badges } = useGamePoints();
  const { language, setLanguage, translate, isInitialized } = useLanguage();
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

  // If not mounted yet, return null to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Nexora Campus Copilot</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Points:</span>
              <span className="text-lg font-bold text-blue-600" suppressHydrationWarning>
                {points}
              </span>
            </div>
            {isInitialized && (
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 ${
                    language === 'en' ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('si')}
                  className={`px-3 py-1 ${
                    language === 'si' ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  සිං
                </button>
                <button
                  onClick={() => setLanguage('ta')}
                  className={`px-3 py-1 ${
                    language === 'ta' ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  தமி
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center ${
                activeTab === 'chat'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-3 text-center ${
                activeTab === 'map'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-3 text-center ${
                activeTab === 'insights'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Insights
            </button>
          </div>

          <div className="h-[calc(100vh-250px)]">
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <ChatWindow />
                </div>
                <div className="flex-shrink-0">
                  <SuggestionBar onSuggestionClick={() => {}} />
                </div>
              </div>
            )}
            {activeTab === 'map' && (
              <div className="h-full">
                <MapView />
              </div>
            )}
            {activeTab === 'insights' && (
              <div className="h-full">
                <DataInsights />
              </div>
            )}
          </div>
        </div>

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
    </main>
  );
}
