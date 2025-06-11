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

export const ChatBusSchedule: React.FC<ChatBusScheduleProps> = ({ 
  buses, 
  title = "🚌 Bus Schedule" 
}) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeUntil = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const busTime = new Date();
    busTime.setHours(hours, minutes, 0, 0);
    
    if (busTime <= now) return 'Departed';
    
    const diff = busTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil > 0) {
      return `in ${hoursUntil}h ${minutesUntil}m`;
    } else {
      return `in ${minutesUntil}m`;
    }
  };

  const getStatusColor = (time: string, status?: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const busTime = new Date();
    busTime.setHours(hours, minutes, 0, 0);
    
    const diff = busTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(diff / (1000 * 60));
    
    if (minutesUntil < 0) return 'bg-red-100 text-red-700 border-red-200';
    if (minutesUntil <= 5) return 'bg-green-100 text-green-700 border-green-200';
    if (minutesUntil <= 15) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (time: string, status?: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const busTime = new Date();
    busTime.setHours(hours, minutes, 0, 0);
    
    const diff = busTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(diff / (1000 * 60));
    
    if (minutesUntil < 0) return '🚌';
    if (minutesUntil <= 5) return '🚌';
    if (minutesUntil <= 15) return '🚌';
    return '🚌';
  };

  if (buses.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">No buses scheduled at this time!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">
            {title}
          </h3>
          <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
            {buses.length} bus{buses.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Buses List */}
      <div className="p-3 space-y-3">
        {buses.map((bus, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            {/* Time and Status Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-gray-900 text-sm">
                  {formatTime(bus.time)}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.time, bus.status)}`}>
                {getTimeUntil(bus.time)}
              </span>
            </div>

            {/* Route and Destination */}
            <div className="mb-2">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                Route {bus.route}
              </h4>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">To {bus.destination}</span>
              </div>
            </div>

            {/* Platform and Capacity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600">
                <Bus className="h-3 w-3" />
                <span className="text-xs">
                  {bus.platform ? `Platform ${bus.platform}` : 'Platform TBD'}
                </span>
              </div>
              {bus.capacity && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{bus.capacity}</span>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon(bus.time, bus.status)}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    getStatusColor(bus.time, bus.status).includes('red') ? 'bg-red-400' :
                    getStatusColor(bus.time, bus.status).includes('green') ? 'bg-green-400' :
                    getStatusColor(bus.time, bus.status).includes('blue') ? 'bg-blue-400' : 'bg-gray-400'
                  }`}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, 100 - (parseInt(bus.time.split(':')[0]) * 60 + parseInt(bus.time.split(':')[1]) - new Date().getHours() * 60 - new Date().getMinutes()) / 24 * 100))}%` 
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
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Arriving soon</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>On time</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>Departed</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 