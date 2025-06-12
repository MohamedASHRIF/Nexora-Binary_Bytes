import React from 'react';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react';

interface EventInfo {
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  attendees?: number;
  category?: 'academic' | 'social' | 'sports' | 'cultural' | 'workshop';
  priority?: 'high' | 'medium' | 'low';
}

interface ChatEventsProps {
  events: EventInfo[];
  title?: string;
}

export const ChatEvents: React.FC<ChatEventsProps> = ({ events, title = "Upcoming Events" }) => {
  const formatDate = (date: string) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Past';
    return `${diffDays} days`;
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'social': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'sports': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'cultural': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'workshop': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'academic': return '📚';
      case 'social': return '🎉';
      case 'sports': return '⚽';
      case 'cultural': return '🎭';
      case 'workshop': return '🔧';
      default: return '📅';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">No upcoming events scheduled!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
      <div className="p-3 border-b border-gray-100 dark:border-slate-600">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          {title}
        </h3>
      </div>
      
      <div className="p-2 space-y-2">
        {events.map((event, index) => (
          <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
            {/* Title and Priority */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex-1">
                {event.title}
              </h4>
              <div className="flex items-center space-x-1">
                <span className="text-xs">{getPriorityIcon(event.priority)}</span>
                <span className="text-xs">{getCategoryIcon(event.category)}</span>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{formatTime(event.time)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{event.location}</span>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {event.description}
              </p>
            )}

            {/* Category Badge and Attendees */}
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(event.category)}`}>
                {event.category || 'General'}
              </span>
              {event.attendees && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{event.attendees} attending</span>
                </div>
              )}
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {getDaysUntil(event.date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 