import React from 'react';

interface SuggestionBarProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  'Show my class schedule',
  'When is the next bus?',
  'What\'s for lunch?',
  'Upcoming events',
];

export const SuggestionBar: React.FC<SuggestionBarProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}; 