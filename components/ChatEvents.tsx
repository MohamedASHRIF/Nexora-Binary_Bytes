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
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-gray-600 text-sm">No upcoming events scheduled!</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
          {title}
        </h3>
      </div>
      
      <div className="p-2 space-y-2">
        {events.map((event, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            {/* Title and Priority */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800 flex-1">
                {event.title}
              </h4>
              <div className="flex items-center space-x-1">
                <span className="text-xs">{getPriorityIcon(event.priority)}</span>
                <span className="text-xs">{getCategoryIcon(event.category)}</span>
              </div>
            </div>

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
              <span className="text-xs text-blue-600 font-medium">
                {getDaysUntil(event.date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 