import React from 'react';
import { Clock, MapPin, Bus, Users } from 'lucide-react';

interface BusInfo {
  time: string;
  route: string;
  destination: string;
  platform?: string;
  capacity?: string;
  status?: 'on-time' | 'delayed' | 'arriving' | 'departed';
}

interface ChatBusScheduleProps {
  buses: BusInfo[];
  title?: string;
}

export const ChatBusSchedule: React.FC<ChatBusScheduleProps> = ({ buses, title = "Bus Schedule" }) => {
  const formatTime = (time: string) => {
    return time;
  };

  const getTimeUntil = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const busTime = new Date();
    busTime.setHours(hours, minutes, 0, 0);
    
    if (busTime < now) {
      busTime.setDate(busTime.getDate() + 1);
    }
    
    const diff = busTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil}m`;
    }
    return `${minutesUntil}m`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'on-time': return 'text-green-600 dark:text-green-400';
      case 'delayed': return 'text-orange-600 dark:text-orange-400';
      case 'arriving': return 'text-blue-600 dark:text-blue-400';
      case 'departed': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'on-time': return '🟢';
      case 'delayed': return '🟡';
      case 'arriving': return '🔵';
      case 'departed': return '⚫';
      default: return '⚪';
    }
  };

  if (buses.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">No buses scheduled!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
      <div className="p-3 border-b border-gray-100 dark:border-slate-600">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Bus className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          {title}
        </h3>
      </div>
      
      <div className="p-2 space-y-2">
        {buses.map((bus, index) => (
          <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
            {/* Time and Status */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Clock className="h-3 w-3" />
                <span className="text-sm font-medium">{formatTime(bus.time)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs">{getStatusIcon(bus.status)}</span>
                <span className={`text-xs font-medium ${getStatusColor(bus.status)}`}>
                  {bus.status || 'scheduled'}
                </span>
              </div>
            </div>

            {/* Route and Destination */}
            <div className="mb-2">
              <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-100 mb-1">
                <Bus className="h-3 w-3" />
                <span className="text-sm font-semibold">Route {bus.route}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{bus.destination}</span>
              </div>
            </div>

            {/* Platform and Capacity */}
            <div className="flex items-center justify-between">
              {bus.platform && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Platform: {bus.platform}
                </span>
              )}
              {bus.capacity && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{bus.capacity}</span>
                </div>
              )}
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {getTimeUntil(bus.time)} left
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 