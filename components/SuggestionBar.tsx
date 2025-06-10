import React from 'react';

interface SuggestionBarProps {
  onSuggestionClick: (suggestion: string) => void;
  recentMessages: string[];
}

export const SuggestionBar: React.FC<SuggestionBarProps> = ({ onSuggestionClick, recentMessages }) => {
  // Show only the last 3 messages, reversed to show most recent first
  const displayMessages = recentMessages.slice(-3).reverse();

  if (displayMessages.length === 0) {
    return (
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50">
        <span className="text-gray-500 text-sm">No recent messages</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50">
      {displayMessages.map((message, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(message)}
          className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors text-sm max-w-xs truncate"
          title={message}
        >
          {message.length > 30 ? `${message.substring(0, 30)}...` : message}
        </button>
      ))}
    </div>
  );
}; 