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

export const ChatEvents: React.FC<ChatEventsProps> = ({ 
  events, 
  title = "📅 Upcoming Events" 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const diff = eventDate.getTime() - today.getTime();
    const daysUntil = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil < 0) return 'Past';
    return `in ${daysUntil} days`;
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'social': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'sports': return 'bg-green-100 text-green-700 border-green-200';
      case 'cultural': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'workshop': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">No upcoming events scheduled!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">
            {title}
          </h3>
          <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Events List */}
      <div className="p-3 space-y-3">
        {events.map((event, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            {/* Header with Category and Priority */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(event.category)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(event.category)}`}>
                  {event.category || 'Event'}
                </span>
              </div>
              <span className="text-lg">{getPriorityIcon(event.priority)}</span>
            </div>

            {/* Event Title */}
            <h4 className="font-bold text-gray-900 text-sm mb-2">
              {event.title}
            </h4>

            {/* Date and Time */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{formatTime(event.time)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{event.location}</span>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {event.description}
              </p>
            )}

            {/* Attendees and Days Until */}
            <div className="flex items-center justify-between">
              {event.attendees && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{event.attendees} attending</span>
                </div>
              )}
              <span className="text-xs text-gray-500">
                {getDaysUntil(event.date)}
              </span>
            </div>

            {/* Progress Bar for Days Until */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    getCategoryColor(event.category).includes('blue') ? 'bg-blue-400' :
                    getCategoryColor(event.category).includes('purple') ? 'bg-purple-400' :
                    getCategoryColor(event.category).includes('green') ? 'bg-green-400' :
                    getCategoryColor(event.category).includes('orange') ? 'bg-orange-400' :
                    getCategoryColor(event.category).includes('indigo') ? 'bg-indigo-400' : 'bg-gray-400'
                  }`}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, 100 - (new Date(event.date).getTime() - new Date().getTime()) / (30 * 24 * 60 * 60 * 1000) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Legend */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-3 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span>🔴</span>
            <span>High priority</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🟡</span>
            <span>Medium priority</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🟢</span>
            <span>Low priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 