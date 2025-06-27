import React, { useEffect, useMemo, useState } from 'react';
import { useQueryLogs } from '../hooks/use-query-logs';
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
  const { queryLogs } = useQueryLogs();

  const [selectedView, setSelectedView] = useState<InsightView>('overview');
  const [stats, setStats] = useState<Stats>({
    totalQueries: 0,
    queriesByType: {
      schedule: 0,
      bus: 0,
      menu: 0,
      events: 0,
      other: 0,
    },
    averageSentiment: 0,
    sentimentTrend: [],
    peakHours: [],
  });

  const computedStats = useMemo(() => {
    if (!queryLogs || queryLogs.length === 0) return {
      totalQueries: 0,
      queriesByType: {
        schedule: 0,
        bus: 0,
        menu: 0,
        events: 0,
        other: 0,
      },
      averageSentiment: 0,
      sentimentTrend: [],
      peakHours: [],
    };

    const totalQueries = queryLogs.length;

    // Regexes for query types
    const regexSchedule = /schedule/i;
    const regexBus = /bus|transport|shuttle|route|stop|station|transit/i;
    const regexMenu = /menu|food/i;
    const regexEvents = /event/i;
    const regexAll = /schedule|bus|transport|shuttle|route|stop|station|transit|menu|food|event/i;

    const queriesByType = {
      schedule: queryLogs.filter(log => regexSchedule.test(log.query)).length,
      bus: queryLogs.filter(log => regexBus.test(log.query)).length,
      menu: queryLogs.filter(log => regexMenu.test(log.query)).length,
      events: queryLogs.filter(log => regexEvents.test(log.query)).length,
      other: queryLogs.filter(log => log.query && !regexAll.test(log.query)).length,
    };
        const moodCounts = {
      positive: queryLogs.filter(log => log.sentiment === 1).length,
      neutral: queryLogs.filter(log => log.sentiment === 0).length,
      negative: queryLogs.filter(log => log.sentiment === -1).length,
    };

    

    const averageSentiment =
      queryLogs.reduce((sum, log) => sum + (log.sentiment ?? 0), 0) / totalQueries;

    // Last 7 sentiment scores for trend visualization
    const sentimentTrend = queryLogs.slice(-7).map(log => log.sentiment ?? 0);

    // Count queries per hour
    const hourCounts = new Array(24).fill(0);
    queryLogs.forEach(log => {
      if (log.timestamp) {
        const hour = new Date(log.timestamp).getHours();
        hourCounts[hour]++;
      }
    });

    // Top 5 peak hours sorted descending by count
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalQueries,
      queriesByType,
      averageSentiment,
      sentimentTrend,
      peakHours,
    };
  }, [queryLogs]);

  useEffect(() => {
    setStats(computedStats);
  }, [computedStats]);

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
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.totalQueries}</p>
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
                  <p className={`text-3xl font-bold ${getSentimentColor(stats.averageSentiment)}`}>
                    {stats.averageSentiment.toFixed(2)}
                  </p>
                </div>
                <div className="text-green-400 dark:text-green-300">
                  <span className="text-2xl">{getSentimentEmoji(stats.averageSentiment)}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Most Popular</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
                    {Object.entries(stats.queriesByType).reduce((a, b) => (a[1] > b[1] ? a : b))[0]}
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
                  <p className="text-xl font-bold text-orange-800 dark:text-orange-200">
                    {stats.peakHours.length > 0 ? `${stats.peakHours[0].hour.toString().padStart(2, '0')}:00` : 'N/A'}
                  </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Query Distribution</h3>
              <div className="space-y-4">
                {Object.entries(stats.queriesByType).map(([type, count]) => {
                  const percentage = stats.totalQueries > 0 ? (count / stats.totalQueries) * 100 : 0;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{type}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{count}</span>
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
            <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Sentiment Analysis</h3>
              <div className="space-y-6">
                <div className="text-center p-4 bg-white dark:bg-slate-600 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">Overall Sentiment</p>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                      getSentimentColor(stats.averageSentiment)
                        .replace('text-', 'bg-')
                        .replace(/-600|-[0-9]+/g, '-100')
                    }`}
                  >
                    <span className="text-2xl">{getSentimentEmoji(stats.averageSentiment)}</span>
                  </div>
                  <p className={`text-lg font-bold mt-2 ${getSentimentColor(stats.averageSentiment)}`}>
                    {stats.averageSentiment.toFixed(2)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Recent Sentiment Trend</h4>
                  <div className="flex space-x-3 justify-center">
                    {stats.sentimentTrend.map((sentiment, index) => {
                      // Get corresponding log from the last 7 entries
                      const logIndex = queryLogs.length - stats.sentimentTrend.length + index;
                      const log = queryLogs[logIndex];
                      const date = log?.timestamp ? new Date(log.timestamp) : null;
                      const weekend = date ? isWeekend(date) : false;
                      const tooltipTitle = date
                        ? `${getWeekdayName(date)}, ${date.toLocaleDateString()} — Sentiment: ${sentiment.toFixed(2)}`
                        : `Sentiment: ${sentiment.toFixed(2)}`;

                      return (
                        <div
                          key={index}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
                            getSentimentColor(sentiment)
                              .replace('text-', 'bg-')
                              .replace(/-600|-[0-9]+/g, '-100')
                          } relative cursor-default`}
                          title={tooltipTitle}
                        >
                          <span className="text-lg">{getSentimentEmoji(sentiment)}</span>
                          {weekend && (
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400 absolute -bottom-5">
                              Weekend
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peak Usage Hours */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Peak Usage Hours</h3>
            <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-lg">
              <div className="grid grid-cols-5 gap-4">
                {stats.peakHours.map(({ hour, count }) => (
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
                          style={{
                            width: `${stats.peakHours.length > 0 ? (count / stats.peakHours[0].count) * 100 : 0}%`,
                          }}
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