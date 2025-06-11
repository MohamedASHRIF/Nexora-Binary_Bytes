import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';

interface ClassInfo {
  time: string;
  subject: string;
  location: string;
  instructor: string;
  duration?: string;
}

interface ChatClassScheduleProps {
  classes: ClassInfo[];
}

export const ChatClassSchedule: React.FC<ChatClassScheduleProps> = ({ classes }) => {
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
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);
    
    if (classTime <= now) return 'Starting now';
    
    const diff = classTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil > 0) {
      return `in ${hoursUntil}h ${minutesUntil}m`;
    } else {
      return `in ${minutesUntil}m`;
    }
  };

  const getStatusColor = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);
    
    const diff = classTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(diff / (1000 * 60));
    
    if (minutesUntil < 0) return 'bg-red-100 text-red-700 border-red-200';
    if (minutesUntil <= 30) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  if (classes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">No more classes scheduled for today!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">
            📚 Your Remaining Classes Today
          </h3>
          <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
            {classes.length} class{classes.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Classes List */}
      <div className="p-3 space-y-3">
        {classes.map((classInfo, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            {/* Time and Status Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-gray-900 text-sm">
                  {formatTime(classInfo.time)}
                </span>
                {classInfo.duration && (
                  <span className="text-xs text-gray-500">
                    ({classInfo.duration})
                  </span>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(classInfo.time)}`}>
                {getTimeUntil(classInfo.time)}
              </span>
            </div>

            {/* Subject */}
            <h4 className="font-bold text-gray-900 text-sm mb-2">
              {classInfo.subject}
            </h4>

            {/* Location and Instructor */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{classInfo.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-3 w-3" />
                <span className="text-xs">with {classInfo.instructor}</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    getStatusColor(classInfo.time).includes('red') ? 'bg-red-400' :
                    getStatusColor(classInfo.time).includes('orange') ? 'bg-orange-400' : 'bg-green-400'
                  }`}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, 100 - (parseInt(classInfo.time.split(':')[0]) * 60 + parseInt(classInfo.time.split(':')[1]) - new Date().getHours() * 60 - new Date().getMinutes()) / 24 * 100))}%` 
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
            <span>Plenty of time</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Starting soon</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 