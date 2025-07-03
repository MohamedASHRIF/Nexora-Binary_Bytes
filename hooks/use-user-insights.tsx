import { useState, useEffect, useCallback } from 'react';

interface UserInsights {
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
  popularQueries: { text: string; count: number }[];
  hourly: number[];
}

interface QueryStats {
  total: number;
  trend: number;
  hourly: number[];
}

interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
}

export const useUserInsights = (timeRange?: "day" | "week" | "month") => {
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Only add timeRange param if provided
      const url = timeRange
        ? `http://localhost:5000/api/users/insights?timeRange=${timeRange}`
        : `http://localhost:5000/api/users/insights`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user insights');
      }

      const data = await response.json();
      setInsights(data.data.insights);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching user insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Calculate derived stats
  const queryStats: QueryStats = {
    total: insights?.totalQueries || 0,
    trend: 0, // Could be calculated by comparing with previous period
    hourly: insights?.hourly || Array(24).fill(0)
  };

  const sentimentStats: SentimentStats = {
    positive: insights?.averageSentiment && insights.averageSentiment > 0.2 
      ? Math.round((insights.averageSentiment + 1) * 50) 
      : 0,
    neutral: insights?.averageSentiment && insights.averageSentiment >= -0.2 && insights.averageSentiment <= 0.2 
      ? Math.round((1 - Math.abs(insights.averageSentiment)) * 100) 
      : 0,
    negative: insights?.averageSentiment && insights.averageSentiment < -0.2 
      ? Math.round((Math.abs(insights.averageSentiment) - 0.2) * 100) 
      : 0
  };

  const popularQueries = insights?.popularQueries || [];

  return {
    insights,
    queryStats,
    sentimentStats,
    popularQueries,
    isLoading,
    error,
    refetch: fetchInsights
  };
}; 