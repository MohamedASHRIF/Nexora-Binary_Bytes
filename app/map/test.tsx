"use client"

import { useState } from 'react';
import { useDailyPromptHistory } from '../../hooks/useDailyPromptHistory';

export default function TestMapPage() {
  const { addPrompt, getTodayPrompts, getStats, clearHistory } = useDailyPromptHistory();
  const [testPrompt, setTestPrompt] = useState('');

  const handleAddTestPrompt = () => {
    if (testPrompt.trim()) {
      addPrompt(testPrompt.trim());
      setTestPrompt('');
    }
  };

  const todayPrompts = getTodayPrompts();
  const stats = getStats();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Daily Prompt History Test</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How it works:</h2>
          <ul className="text-left text-sm text-gray-700 space-y-1">
            <li>• Every prompt you send is automatically saved with today's date</li>
            <li>• You can view today's prompts or all historical prompts</li>
            <li>• Click on any saved prompt to reuse it</li>
            <li>• Delete individual prompts or clear all history</li>
            <li>• Data is stored locally and persists between sessions</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test the Feature</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a test prompt..."
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTestPrompt()}
            />
            <button
              onClick={handleAddTestPrompt}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Add Prompt
            </button>
          </div>
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => addPrompt('Where is the library?')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
            >
              Add Sample 1
            </button>
            <button
              onClick={() => addPrompt('What are the cafeteria hours?')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
            >
              Add Sample 2
            </button>
            <button
              onClick={() => addPrompt('How do I register for classes?')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
            >
              Add Sample 3
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium">Today's Prompts</div>
              <div className="text-2xl font-bold text-blue-600">{stats.todayPrompts}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium">Total Prompts</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalPrompts}</div>
            </div>
          </div>
        </div>

        {todayPrompts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Today's Prompts</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {todayPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-3 bg-gray-50 rounded border text-left"
                >
                  <div className="text-sm text-gray-800 mb-1">{prompt.prompt}</div>
                  <div className="text-xs text-gray-500">
                    {prompt.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <button
            onClick={clearHistory}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Clear All History
          </button>
          <a
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            Back to Main App
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>💡 Tip: Go to the Chat tab in the main app to see the full history sidebar!</p>
        </div>
      </div>
    </div>
  );
} 