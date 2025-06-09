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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Usage Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Query Distribution</h3>
          <div className="space-y-2">
            {Object.entries(stats.queriesByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Queries</span>
                <span>{stats.totalQueries}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Sentiment Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Sentiment</span>
              <span className={`font-medium ${getSentimentColor(stats.averageSentiment)}`}>
                {getSentimentEmoji(stats.averageSentiment)} {stats.averageSentiment.toFixed(2)}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Sentiment Trend</h4>
              <div className="flex space-x-2">
                {stats.sentimentTrend.map((sentiment, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getSentimentColor(sentiment)}`}
                    title={`Sentiment: ${sentiment.toFixed(2)}`}
                  >
                    {getSentimentEmoji(sentiment)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Peak Usage Hours</h3>
          <div className="grid grid-cols-5 gap-4">
            {stats.peakHours.map(({ hour, count }) => (
              <div key={hour} className="text-center">
                <div className="text-sm text-gray-600">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="text-lg font-medium">{count}</div>
                <div className="text-xs text-gray-500">queries</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 