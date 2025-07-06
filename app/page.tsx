"use client"

import { useState, useEffect } from 'react';
import { useGamePoints } from '../hooks/useGamePoints';
import { useDailyPromptHistory } from '../hooks/useDailyPromptHistory';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Home() {
  const { badges } = useGamePoints();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [homeQuestion, setHomeQuestion] = useState('');
  const { addPrompt } = useDailyPromptHistory();
  const { language, setLanguage } = useLanguage();

  const handleAsk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (homeQuestion.trim() === '') return;
    addPrompt(homeQuestion.trim());
    setHomeQuestion('');
    // Optionally, redirect to chat page with the question as a query param
    router.push(`/chat?initialMessage=${encodeURIComponent(homeQuestion.trim())}`);
  };

  useEffect(() => {
    setIsMounted(true);
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-slate-900">
      {/* Fixed Navigation Bar - Below main header */}
      <nav className="fixed top-16 left-0 right-0 z-40 w-full flex items-center bg-white dark:bg-slate-800 justify-end px-8 py-2 gap-6 border-t border-gray-100 dark:border-slate-700 shadow-sm">
        {/* Language Selector on the left */}
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Language</span>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as 'en' | 'si' | 'ta')}
            className="border rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ minWidth: 80 }}
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded font-semibold transition-colors bg-blue-500 dark:bg-blue-600 text-white"
        >
          Home
        </Link>
        <Link
          href="/chat"
          className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
        >
          Chat
        </Link>
        <Link
          href="/map"
          className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
        >
          Map
        </Link>
        <Link
          href="/insights"
          className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
        >
          Insights
        </Link>
        <Link
          href="/forum"
          className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
        >
          💬 Forum
        </Link>
      </nav>

      {/* Main Content Area - Below fixed headers */}
      <div className="flex flex-1 pt-28 min-h-0">
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
          {badges.length > 0 && (
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
