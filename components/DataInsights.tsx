// File: frontend/src/components/DataInsights.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useQueryLogs } from '../hooks/use-query-logs';
import { MoodMap } from './MoodMap';
import { ChatWidoo } from './ChatWidoo';

type InsightView = 'overview' | 'moodmap' | 'chatmap';

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

  const computedStats = useMemo<Stats>(() => {
    if (!queryLogs || queryLogs.length === 0) return stats;

    const totalQueries = queryLogs.length;

    // Count queries by type with regex matching (case-insensitive)
    const queriesByType = {
      schedule: queryLogs.filter(log => /schedule/i.test(log.query)).length,
      bus: queryLogs.filter(log =>
        /bus|transport|shuttle|route|stop|station|transit/i.test(log.query)
      ).length,
      menu: queryLogs.filter(log => /menu|food/i.test(log.query)).length,
      events: queryLogs.filter(log => /event/i.test(log.query)).length,
      other: queryLogs.filter(
        log =>
          log.query &&
          !/schedule|bus|transport|shuttle|route|stop|station|transit|menu|food|event/i.test(
            log.query
          )
      ).length,
    };

    // Calculate average sentiment safely
    const averageSentiment =
      queryLogs.reduce((sum, log) => sum + (log.sentiment ?? 0), 0) / totalQueries;

    // Get last 7 sentiments for trend
    const sentimentTrend = queryLogs
      .slice(-7)
      .map(log => log.sentiment ?? 0);

    // Count queries per hour
    const hourCounts = new Array(24).fill(0);
    queryLogs.forEach(log => {
      if (log.timestamp) {
        const hour = new Date(log.timestamp).getHours();
        hourCounts[hour]++;
      }
    });

    // Get top 5 peak hours sorted descending
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
  }, [queryLogs, stats]);

  useEffect(() => {
    setStats(computedStats);
  }, [computedStats]);

  // Helper to assign color classes based on sentiment
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'text-green-600';
    if (sentiment < -0.5) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Helper to display emoji based on sentiment
  const getSentimentEmoji = (sentiment: number) => {
    if (sentiment > 0.5) return '😊';
    if (sentiment < -0.5) return '😢';
    return '😐';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Usage Insights</h2>
        <select
          className="border border-gray-300 rounded px-3 py-1 text-gray-700"
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value as InsightView)}
          aria-label="Select Insight View"
        >
          <option value="overview">Overview</option>
          <option value="moodmap">MoodMap</option>
          <option value="chatmap">Chat Map</option>
        </select>
      </div>

      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Query Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Query Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats.queriesByType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sentiment Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Sentiment</span>
                <span className={`font-medium ${getSentimentColor(stats.averageSentiment)}`}>
                  {getSentimentEmoji(stats.averageSentiment)} {stats.averageSentiment.toFixed(1)}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Sentiment Trend (Last 7)</h4>
                <div className="flex space-x-2">
                  {stats.sentimentTrend.map((sentiment, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getSentimentColor(
                        sentiment
                      )}`}
                      title={`Sentiment: ${sentiment.toFixed(1)}`}
                      aria-label={`Sentiment for day ${index + 1}: ${sentiment.toFixed(1)}`}
                    >
                      {getSentimentEmoji(sentiment)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Peak Usage Hours */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Peak Usage Hours</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {stats.peakHours.map(({ hour, count }) => (
                <div key={hour} className="text-center">
                  <div className="text-sm text-gray-600">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="text-lg font-medium">{count}</div>
                  <div className="text-xs text-gray-500">total queries</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'moodmap' && (
        <div className="mt-6">
          <MoodMap trend={stats.sentimentTrend} />
        </div>
      )}

      {selectedView === 'chatmap' && (
        <div className="mt-6">
          <ChatWidoo />
        </div>
      )}
    </div>
  );
};
