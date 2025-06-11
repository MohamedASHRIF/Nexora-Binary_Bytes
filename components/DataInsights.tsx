import React, { useEffect, useState } from 'react';
import { useQueryLogs } from '../hooks/use-query-logs';

interface QueryStats {
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
  const [stats, setStats] = useState<QueryStats>({
    totalQueries: 0,
    queriesByType: {
      schedule: 0,
      bus: 0,
      menu: 0,
      events: 0,
      other: 0
    },
    averageSentiment: 0,
    sentimentTrend: [],
    peakHours: []
  });

  useEffect(() => {
    if (queryLogs.length === 0) return;

    // Calculate total queries
    const totalQueries = queryLogs.length;

    // Calculate queries by type
    const queriesByType = {
      schedule: queryLogs.filter(log => log.query?.toLowerCase().includes('schedule')).length,
      bus: queryLogs.filter(log => log.query?.toLowerCase().includes('bus')).length,
      menu: queryLogs.filter(log => log.query?.toLowerCase().includes('menu') || log.query?.toLowerCase().includes('food')).length,
      events: queryLogs.filter(log => log.query?.toLowerCase().includes('event')).length,
      other: queryLogs.filter(log => 
        log.query && !log.query.toLowerCase().includes('schedule') &&
        !log.query.toLowerCase().includes('bus') &&
        !log.query.toLowerCase().includes('menu') &&
        !log.query.toLowerCase().includes('food') &&
        !log.query.toLowerCase().includes('event')
      ).length
    };

    // Calculate average sentiment
    const averageSentiment = queryLogs.reduce((sum, log) => sum + (log.sentiment || 0), 0) / totalQueries;

    // Calculate sentiment trend (last 7 queries)
    const sentimentTrend = queryLogs.slice(-7).map(log => log.sentiment || 0);

    // Calculate peak hours
    const hourCounts = new Array(24).fill(0);
    queryLogs.forEach(log => {
      if (log.timestamp) {
        const hour = new Date(log.timestamp).getHours();
        hourCounts[hour]++;
      }
    });
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalQueries,
      queriesByType,
      averageSentiment,
      sentimentTrend,
      peakHours
    });
  }, [queryLogs]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'text-green-600';
    if (sentiment < -0.5) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentEmoji = (sentiment: number) => {
    if (sentiment > 0.5) return '😊';
    if (sentiment < -0.5) return '😢';
    return '😐';
  };

  const getSentimentBgColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'bg-green-100';
    if (sentiment < -0.5) return 'bg-red-100';
    return 'bg-yellow-100';
  };

  return (
    <div className="min-h-full bg-white rounded-lg shadow-lg p-6 lg:p-8">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8">Usage Insights Dashboard</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Queries</p>
              <p className="text-3xl font-bold text-blue-800">{stats.totalQueries}</p>
            </div>
            <div className="text-blue-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Avg Sentiment</p>
              <p className={`text-3xl font-bold ${getSentimentColor(stats.averageSentiment)}`}>
                {stats.averageSentiment.toFixed(2)}
              </p>
            </div>
            <div className="text-green-400">
              <span className="text-2xl">{getSentimentEmoji(stats.averageSentiment)}</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Most Popular</p>
              <p className="text-xl font-bold text-purple-800">
                {Object.entries(stats.queriesByType).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
              </p>
            </div>
            <div className="text-purple-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Peak Hour</p>
              <p className="text-xl font-bold text-orange-800">
                {stats.peakHours.length > 0 ? `${stats.peakHours[0].hour.toString().padStart(2, '0')}:00` : 'N/A'}
              </p>
            </div>
            <div className="text-orange-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Query Distribution */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Query Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.queriesByType).map(([type, count]) => {
              const percentage = stats.totalQueries > 0 ? (count / stats.totalQueries) * 100 : 0;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize font-medium">{type}</span>
                    <span className="font-bold text-gray-800">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Sentiment Analysis</h3>
          <div className="space-y-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-gray-600 mb-2">Overall Sentiment</p>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getSentimentBgColor(stats.averageSentiment)}`}>
                <span className="text-2xl">{getSentimentEmoji(stats.averageSentiment)}</span>
              </div>
              <p className={`text-lg font-bold mt-2 ${getSentimentColor(stats.averageSentiment)}`}>
                {stats.averageSentiment.toFixed(2)}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Sentiment Trend</h4>
              <div className="flex space-x-3 justify-center">
                {stats.sentimentTrend.map((sentiment, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${getSentimentBgColor(sentiment)}`}
                    title={`Query ${index + 1}: ${sentiment.toFixed(2)}`}
                  >
                    <span className="text-lg">{getSentimentEmoji(sentiment)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Usage Hours */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Peak Usage Hours</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-5 gap-4">
            {stats.peakHours.map(({ hour, count }) => (
              <div key={hour} className="text-center bg-white p-4 rounded-lg shadow-sm">
                <div className="text-lg font-bold text-blue-600">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className="text-sm text-gray-500">queries</div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full" 
                      style={{ 
                        width: `${stats.peakHours.length > 0 ? (count / stats.peakHours[0].count) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {stats.totalQueries === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Start using the chat to see insights and analytics here.</p>
        </div>
      )}
    </div>
  );
}; 