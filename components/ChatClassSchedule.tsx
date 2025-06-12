import React from 'react';
import { Clock, MapPin, User, BookOpen } from 'lucide-react';

interface ClassInfo {
  time: string;
  subject: string;
  location: string;
  instructor: string;
  duration: string;
}

interface ChatClassScheduleProps {
  classes: ClassInfo[];
  title?: string;
}

export const ChatClassSchedule: React.FC<ChatClassScheduleProps> = ({ classes, title = "Today's Classes" }) => {
  const formatTime = (time: string) => {
    return time;
  };

  const getTimeUntil = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);
    
    if (classTime < now) {
      classTime.setDate(classTime.getDate() + 1);
    }
    
    const diff = classTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil}m`;
    }
    return `${minutesUntil}m`;
  };

  const getProgress = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);
    
    if (classTime < now) {
      classTime.setDate(classTime.getDate() + 1);
    }
    
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);
    
    const totalDay = dayEnd.getTime() - dayStart.getTime();
    const elapsed = now.getTime() - dayStart.getTime();
    
    return Math.min((elapsed / totalDay) * 100, 100);
  };

  if (classes.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">No classes scheduled for today!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
      <div className="p-3 border-b border-gray-100 dark:border-slate-600">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          {title}
        </h3>
      </div>
      
      <div className="p-2 space-y-2">
        {classes.map((classInfo, index) => (
          <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
            {/* Time and Countdown */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Clock className="h-3 w-3" />
                <span className="text-sm font-medium">{formatTime(classInfo.time)}</span>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {getTimeUntil(classInfo.time)} left
              </span>
            </div>

            {/* Subject */}
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
              {classInfo.subject}
            </h4>

            {/* Location and Instructor */}
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 mb-2">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{classInfo.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span className="text-xs">{classInfo.instructor}</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Duration: {classInfo.duration}
              </span>
              <div className="w-16 h-1 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress(classInfo.time)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 