import { useState, useEffect, useCallback } from 'react';
import { setItem, getItem } from '../utils/offlineStorage';

export interface DailyPrompt {
  id: string;
  prompt: string;
  timestamp: Date;
  date: string; // YYYY-MM-DD format
  topic?: string; // Optional topic categorization
}

export interface DailyPromptHistory {
  [date: string]: DailyPrompt[];
}

export const useDailyPromptHistory = () => {
  const [history, setHistory] = useState<DailyPromptHistory>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedHistory = getItem<DailyPromptHistory>('dailyPromptHistory');
      if (savedHistory) {
        // Convert timestamp strings back to Date objects
        const convertedHistory: DailyPromptHistory = {};
        Object.keys(savedHistory).forEach(date => {
          convertedHistory[date] = savedHistory[date].map(prompt => ({
            ...prompt,
            timestamp: new Date(prompt.timestamp)
          }));
        });
        setHistory(convertedHistory);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save to localStorage when history changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      setItem('dailyPromptHistory', history, 24 * 30); // Keep for 30 days
    }
  }, [history, isInitialized]);

  // Add a new prompt to today's history
  const addPrompt = useCallback((prompt: string, topic?: string) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const newPrompt: DailyPrompt = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt,
      timestamp: new Date(),
      date: today,
      topic
    };

    setHistory(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), newPrompt]
    }));
  }, []);

  // Get prompts for a specific date
  const getPromptsForDate = useCallback((date: string): DailyPrompt[] => {
    return history[date] || [];
  }, [history]);

  // Get today's prompts
  const getTodayPrompts = useCallback((): DailyPrompt[] => {
    const today = new Date().toISOString().split('T')[0];
    return getPromptsForDate(today);
  }, [getPromptsForDate]);

  // Get all dates that have prompts
  const getAvailableDates = useCallback((): string[] => {
    return Object.keys(history).sort((a, b) => b.localeCompare(a)); // Most recent first
  }, [history]);

  // Get recent prompts (last 7 days)
  const getRecentPrompts = useCallback((): DailyPrompt[] => {
    const dates = getAvailableDates();
    const recentDates = dates.slice(0, 7);
    const allPrompts: DailyPrompt[] = [];
    
    recentDates.forEach(date => {
      allPrompts.push(...history[date]);
    });
    
    return allPrompts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [history, getAvailableDates]);

  // Delete a specific prompt
  const deletePrompt = useCallback((promptId: string) => {
    setHistory(prev => {
      const newHistory = { ...prev };
      Object.keys(newHistory).forEach(date => {
        newHistory[date] = newHistory[date].filter(prompt => prompt.id !== promptId);
        if (newHistory[date].length === 0) {
          delete newHistory[date];
        }
      });
      return newHistory;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory({});
  }, []);

  // Get prompt statistics
  const getStats = useCallback(() => {
    const totalPrompts = Object.values(history).reduce((sum, prompts) => sum + prompts.length, 0);
    const totalDays = Object.keys(history).length;
    const today = new Date().toISOString().split('T')[0];
    const todayPrompts = history[today]?.length || 0;

    return {
      totalPrompts,
      totalDays,
      todayPrompts,
      averagePerDay: totalDays > 0 ? Math.round(totalPrompts / totalDays) : 0
    };
  }, [history]);

  return {
    history,
    addPrompt,
    getPromptsForDate,
    getTodayPrompts,
    getAvailableDates,
    getRecentPrompts,
    deletePrompt,
    clearHistory,
    getStats,
    isInitialized
  };
}; 