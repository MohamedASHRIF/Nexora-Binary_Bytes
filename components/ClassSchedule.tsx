import React from 'react';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

interface ClassInfo {
  time: string;
  subject: string;
  location: string;
  instructor: string;
  duration?: string;
}

interface ClassScheduleProps {
  classes: ClassInfo[];
  title?: string;
}

export const ClassSchedule: React.FC<ClassScheduleProps> = ({ 
  classes, 
  title = "Today's Remaining Classes" 
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
    
    if (minutesUntil < 0) return 'bg-red-100 text-red-800 border-red-200';
    if (minutesUntil <= 30) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No More Classes Today</h3>
          <p className="text-sm">You're all done for today!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <div className="text-white text-sm font-medium">
            {classes.length} class{classes.length !== 1 ? 'es' : ''} remaining
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="p-6 space-y-4">
        {classes.map((classInfo, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            {/* Time and Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold text-gray-900">
                  {formatTime(classInfo.time)}
                </span>
                {classInfo.duration && (
                  <span className="text-sm text-gray-500">
                    ({classInfo.duration})
                  </span>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(classInfo.time)}`}>
                {getTimeUntil(classInfo.time)}
              </span>
            </div>

            {/* Subject */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {classInfo.subject}
            </h3>

            {/* Location and Instructor */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{classInfo.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm">with {classInfo.instructor}</span>
              </div>
            </div>

            {/* Progress Bar for Time */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Time until class</span>
                <span>{getTimeUntil(classInfo.time)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getStatusColor(classInfo.time).includes('red') ? 'bg-red-500' :
                    getStatusColor(classInfo.time).includes('orange') ? 'bg-orange-500' : 'bg-green-500'
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

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Plenty of time</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Starting soon</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 