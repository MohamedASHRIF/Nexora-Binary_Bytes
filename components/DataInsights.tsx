import React, { useEffect, useMemo, useState } from 'react';
import { useUserInsights } from '../hooks/use-user-insights';
import { MoodMap } from './MoodMap'; // Assuming MoodMap is a default export
import { ChatWidoo } from './ChatWidoo'; 
import { Sentiments } from './Sentiments';


type InsightView = 'overview' | 'moodmap' | 'chatmap' | 'sentiment';

interface QueryLog {
  query: string;
  sentiment?: number;
  timestamp?: string;
}

interface Stats {
  totalQueries: number;
  queriesByType: {
    schedule: number;
    bus: number;
    menu: number;
    events: number;
    other: number;
  };
  averageSentiment: number;
  sentimentTrend: number[];
  peakHours: { hour: number; count: number }[];
}

export const DataInsights: React.FC = () => {
  const { insights, queryStats, sentimentStats, popularQueries, isLoading, error } = useUserInsights();
  const [selectedView, setSelectedView] = useState<InsightView>('overview');

  if (isLoading) {
    return <div>Loading insights...</div>;
  }
  if (error) {
    return <div>Error loading insights: {error}</div>;
  }

  // Use insights, queryStats, sentimentStats, popularQueries for UI
  // ... rest of the UI logic, using only backend data ...

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Usage Insights</h2>
        <select
          className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700"
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value as InsightView)}
          aria-label="Select Insight View"
        >
          <option value="overview">Overview</option>
          <option value="moodmap">MoodMap</option>
          <option value="chatmap">Chat Map</option>
          <option value="sentiment">Game</option>
        </select>
      </div>

      {selectedView === 'overview' && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Queries</p>
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{queryStats.total}</p>
                </div>
                <div className="text-blue-400 dark:text-blue-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">Avg Sentiment</p>
                  <p className={`text-3xl font-bold ${getSentimentColor(insights?.averageSentiment ?? 0)}`}>{(insights?.averageSentiment ?? 0).toFixed(2)}</p>
                </div>
                <div className="text-green-400 dark:text-green-300">
                  <span className="text-2xl">{getSentimentEmoji(insights?.averageSentiment ?? 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Most Popular</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-200 truncate max-w-xs" title={popularQueries.length > 0 ? popularQueries[0].text : ''}>
                    {popularQueries.length > 0 ? (popularQueries[0].text.length > 40 ? popularQueries[0].text.slice(0, 40) + '...' : popularQueries[0].text) : 'N/A'}
                  </p>
                </div>
                <div className="text-purple-400 dark:text-purple-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Peak Hour</p>
                  <p className="text-xl font-bold text-orange-800 dark:text-orange-200">{insights?.peakHours?.length && insights.peakHours.length > 0 ? `${insights.peakHours[0].hour.toString().padStart(2, '0')}:00` : 'N/A'}</p>
                </div>
                <div className="text-orange-400 dark:text-orange-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Query Distribution */}
          <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Query Distribution</h3>
            <div className="space-y-4">
              {insights?.queriesByType && Object.entries(insights.queriesByType).map(([type, count]) => {
                const percentage = queryStats.total > 0 ? (count as number / queryStats.total) * 100 : 0;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{type}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-100">{count as number}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white dark:bg-slate-600 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Sentiment Analysis</h3>
            <div className="text-center p-4 bg-white dark:bg-slate-600 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Overall Sentiment</p>
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getSentimentColor(insights?.averageSentiment ?? 0).replace('text-', 'bg-').replace(/-600|-[0-9]+/g, '-100')}`}
              >
                <span className="text-2xl">{getSentimentEmoji(insights?.averageSentiment ?? 0)}</span>
              </div>
              <p className={`text-lg font-bold mt-2 ${getSentimentColor(insights?.averageSentiment ?? 0)}`}>{(insights?.averageSentiment ?? 0).toFixed(2)}</p>
            </div>

            <h4 className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Sentiment Trend</h4>
            <div className="h-24 flex items-center">
              <svg viewBox="0 0 100 50" width="100%" height="100%" preserveAspectRatio="none">
                {/* You can plot insights?.sentimentTrend here if you want */}
                <path
                  d="M0,25 L10,20 L20,30 L30,15 L40,25 L50,10 L60,20 L70,15 L80,25 L90,5 L100,15"
                  fill="none"
                  stroke="rgb(147, 51, 234)"
                  strokeWidth="2"
                  className="dark:stroke-purple-400"
                />
              </svg>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Peak Usage Hours</h3>
            <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-lg">
              <div className="grid grid-cols-5 gap-4">
                {insights?.peakHours?.map(({ hour, count }) => (
                  <div key={hour} className="text-center bg-white dark:bg-slate-600 p-4 rounded-lg shadow-sm">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{count}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">queries</div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-slate-500 rounded-full h-1">
                        <div
                          className="bg-blue-500 dark:bg-blue-400 h-1 rounded-full"
                          style={{ width: `${insights?.peakHours && insights.peakHours[0]?.count > 0 ? (count / insights.peakHours[0].count) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedView === 'moodmap' && (
        <div className="mt-6">
          <MoodMap />
        </div>
      )}

      {selectedView === 'chatmap' && (
        <div className="mt-6">
          <ChatWidoo />
        </div>
      )}

      {selectedView === 'sentiment' && (
        <div className="mt-6">
          <Sentiments 
          averageSentiment={stats.averageSentiment}
          sentimentTrend={stats.sentimentTrend}
          />
          {/* averageSentiment={stats.averageSentiment} sentimentTrend={stats.sentimentTrend} /> */}
        </div>
      )}

      {stats.totalQueries === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Start using the chat to see your personalized insights and analytics here.</p>
        </div>
      )}
    </div>
  );
};

// Assign color classes based on sentiment
const getSentimentColor = (sentiment: number) => {
  if (sentiment > 0.5) return 'text-green-600 dark:text-green-400';
  if (sentiment < -0.5) return 'text-red-600 dark:text-red-400';
  return 'text-yellow-600 dark:text-yellow-400';
};

// Emoji based on sentiment value
const getSentimentEmoji = (sentiment: number) => {
  if (sentiment > 0.5) return '😊';
  if (sentiment < -0.5) return '😢';
  return '😐';
};

const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const getWeekdayName = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: 'long' });