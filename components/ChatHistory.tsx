import React, { useState } from 'react';
import { useDailyPromptHistory, type DailyPrompt } from '../hooks/useDailyPromptHistory';
import { Trash2, Calendar, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatHistoryProps {
  onPromptClick?: (prompt: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ onPromptClick }) => {
  const {
    history,
    getTodayPrompts,
    getAvailableDates,
    getPromptsForDate,
    deletePrompt,
    clearHistory,
    getStats,
    isInitialized
  } = useDailyPromptHistory();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [isTodayExpanded, setIsTodayExpanded] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize selected date to today if not set
  React.useEffect(() => {
    if (!selectedDate && isInitialized) {
      setSelectedDate(today);
      setExpandedDates(new Set([today]));
    }
  }, [selectedDate, today, isInitialized]);

  const stats = getStats();
  const availableDates = getAvailableDates();
  const todayPrompts = getTodayPrompts();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const toggleTodayExpansion = () => {
    setIsTodayExpanded(!isTodayExpanded);
  };

  const handlePromptClick = (prompt: string) => {
    onPromptClick?.(prompt);
  };

  const handleDeletePrompt = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    deletePrompt(promptId);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  if (!isInitialized) {
    return (
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r p-4 flex flex-col">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-gray-50 border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chat History
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('today')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'today' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              All
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Today's prompts:</span>
            <span className="font-medium">{stats.todayPrompts}</span>
          </div>
          <div className="flex justify-between">
            <span>Total prompts:</span>
            <span className="font-medium">{stats.totalPrompts}</span>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'today' ? (
          <div className="p-4">
            {/* Today's Prompts Dropdown */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={toggleTodayExpansion}
                className="w-full p-3 bg-white hover:bg-gray-50 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Today's Prompts
                  </span>
                  <span className="text-xs text-gray-500">
                    ({todayPrompts.length} prompt{todayPrompts.length !== 1 ? 's' : ''})
                  </span>
                </div>
                {isTodayExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {isTodayExpanded && (
                <div className="border-t bg-gray-50 p-3 space-y-2">
                  {todayPrompts.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">
                      <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No prompts today</p>
                      <p className="text-xs">Start chatting to see your history here</p>
                    </div>
                  ) : (
                    todayPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        onClick={() => handlePromptClick(prompt.prompt)}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-800 flex-1 overflow-hidden">
                            <span className="block truncate" title={prompt.prompt}>
                              {prompt.prompt}
                            </span>
                          </p>
                          <button
                            onClick={(e) => handleDeletePrompt(e, prompt.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity flex-shrink-0"
                            title="Delete prompt"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTime(prompt.timestamp)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">All History</h3>
              {availableDates.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {availableDates.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history</p>
                <p className="text-xs">Start chatting to see your history here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableDates.map((date) => {
                  const prompts = getPromptsForDate(date);
                  const isExpanded = expandedDates.has(date);
                  
                  return (
                    <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDateExpansion(date)}
                        className="w-full p-3 bg-white hover:bg-gray-50 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(date)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({prompts.length} prompt{prompts.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t bg-gray-50 p-3 space-y-2">
                          {prompts.map((prompt) => (
                            <div
                              key={prompt.id}
                              onClick={() => handlePromptClick(prompt.prompt)}
                              className="p-2 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-gray-800 flex-1 overflow-hidden">
                                  <span className="block truncate" title={prompt.prompt}>
                                    {prompt.prompt}
                                  </span>
                                </p>
                                <button
                                  onClick={(e) => handleDeletePrompt(e, prompt.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity flex-shrink-0"
                                  title="Delete prompt"
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {formatTime(prompt.timestamp)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 