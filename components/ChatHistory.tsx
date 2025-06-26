import React, { useState } from 'react';
import { useChatbot } from '../hooks/use-chatbot';
import { Trash2, Calendar, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatHistoryProps {
  onPromptClick?: (prompt: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ onPromptClick }) => {
  const { messages, isProcessing } = useChatbot();
  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);
  const availableDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [isTodayExpanded, setIsTodayExpanded] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize selected date to today if not set
  React.useEffect(() => {
    if (!selectedDate && Object.keys(grouped).length > 0) {
      setSelectedDate(today);
      setExpandedDates(new Set([today]));
    }
  }, [selectedDate, today, Object.keys(grouped).length]);

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

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4 flex flex-col">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chat History
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('today')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'today' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'all' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'today' ? (
          <div className="p-4">
            {/* Today's Prompts Dropdown */}
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={toggleTodayExpansion}
                className="w-full p-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Today's Prompts
                  </span>
                </div>
                {isTodayExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {isTodayExpanded && (
                <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-3 space-y-2">
                  {Object.keys(grouped).length === 0 ? (
                    <div className="text-center text-gray-400 dark:text-gray-500 py-4">
                      <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No prompts today</p>
                      <p className="text-xs">Start chatting to see your history here</p>
                    </div>
                  ) : (
                    Object.entries(grouped).map(([date, prompts]) => {
                      const isExpanded = expandedDates.has(date);
                      
                      return (
                        <div key={date} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleDateExpansion(date)}
                            className="w-full p-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-left transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(date)}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>
                          
                          {isExpanded && (
                            <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-3 space-y-2">
                              {prompts.map((msg, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handlePromptClick && handlePromptClick(msg.text)}
                                  className="p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all group"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 flex-1 overflow-hidden">
                                      <span className="block truncate" title={msg.text}>
                                        {msg.text}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(new Date(msg.timestamp))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">All History</h3>
            </div>
            
            {availableDates.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history</p>
                <p className="text-xs">Start chatting to see your history here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableDates.map((date) => {
                  const prompts = grouped[date];
                  const isExpanded = expandedDates.has(date);
                  
                  return (
                    <div key={date} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDateExpansion(date)}
                        className="w-full p-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(date)}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-3 space-y-2">
                          {prompts.map((msg, idx) => (
                            <div
                              key={idx}
                              onClick={() => handlePromptClick && handlePromptClick(msg.text)}
                              className="p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-gray-800 dark:text-gray-200 flex-1 overflow-hidden">
                                  <span className="block truncate" title={msg.text}>
                                    {msg.text}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatTime(new Date(msg.timestamp))}
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