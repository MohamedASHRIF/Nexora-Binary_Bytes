'use client';

import { Sentiments } from '../../components/Sentiments';

export default function GamePage() {
  return (
    <div className="w-full h-screen pt-28 p-4">
      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Sentiment Game</h1>
          <Sentiments averageSentiment={0} sentimentTrend={[]} />
        </div>
      </div>
    </div>
  );
} 