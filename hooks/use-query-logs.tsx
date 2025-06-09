"use client"

import { useState, useCallback, useEffect } from 'react';

export interface QueryLog {
  id: string;
  query: string;
  timestamp: Date;
  sentiment: number;
  responseTime: number;
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

interface PopularQuery {
  text: string;
  count: number;
}

const isBrowser = typeof window !== 'undefined';

export const useQueryLogs = () => {
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>(() => {
    if (!isBrowser) return [];
    
    const saved = localStorage.getItem('queryLogs');
    return saved ? JSON.parse(saved).map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    })) : [];
  });

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (!isBrowser) return;
    
    localStorage.setItem('queryLogs', JSON.stringify(queryLogs));
  }, [queryLogs]);

  const addQueryLog = useCallback((log: Omit<QueryLog, 'id'>) => {
    const newLog: QueryLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    setQueryLogs(prev => [...prev, newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setQueryLogs([]);
  }, []);

  const [queryStats, setQueryStats] = useState<QueryStats>({ total: 0, trend: 0, hourly: [] })
  const [sentimentStats, setSentimentStats] = useState<SentimentStats>({ positive: 0, neutral: 0, negative: 0 })
  const [popularQueries, setPopularQueries] = useState<PopularQuery[]>([])

  // Calculate stats based on query logs and time range
  useEffect(() => {
    // Filter logs based on time range
    const now = new Date()
    const timeRangeMs = "day" === "day" ? 86400000 : "week" === "week" ? 604800000 : 2592000000 // month

    const filteredLogs = queryLogs.filter((log) => now.getTime() - log.timestamp.getTime() < timeRangeMs)

    // Calculate query stats
    const total = filteredLogs.length
    const trend = total > 0 ? 100 : 0 // Simplified trend calculation

    // Generate hourly distribution
    const hourly = Array(24).fill(0)
    filteredLogs.forEach(log => {
      const hour = log.timestamp.getHours()
      hourly[hour]++
    })

    setQueryStats({
      total,
      trend,
      hourly,
    })

    // Calculate sentiment stats
    const positive = Math.round((filteredLogs.filter((log) => log.sentiment > 0.2).length / total) * 100) || 0
    const negative = Math.round((filteredLogs.filter((log) => log.sentiment < -0.2).length / total) * 100) || 0
    const neutral = 100 - positive - negative

    setSentimentStats({
      positive,
      neutral,
      negative,
    })

    // Calculate popular queries
    const queryCounts: Record<string, number> = {}
    filteredLogs.forEach((log) => {
      if (log.query) {
        const text = log.query.toLowerCase().trim()
        if (text) {
          queryCounts[text] = (queryCounts[text] || 0) + 1
        }
      }
    })

    const popular = Object.entries(queryCounts)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setPopularQueries(popular)
  }, [queryLogs])

  return {
    queryLogs,
    addQueryLog,
    clearLogs,
    queryStats,
    sentimentStats,
    popularQueries,
  }
}
