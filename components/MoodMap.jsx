// File: frontend/src/components/MoodMap.jsx
import React, { useEffect, useState } from "react";
import { getSentimentStats } from "../utils/logger";

export function MoodMap() {
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getSentimentStats());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const total = stats.positive + stats.neutral + stats.negative;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">MoodMap</h2>
      <div className="space-y-2">
        <p className="text-green-600">Positive: {stats.positive}</p>
        <p className="text-yellow-600">Neutral: {stats.neutral}</p>
        <p className="text-red-600">Negative: {stats.negative}</p>
        <p className="mt-2 font-semibold">
          Overall Mood: {total === 0 ? "Neutral" : getOverallMood(stats)}
        </p>
      </div>
    </div>
  );
}

function getOverallMood(stats) {
  const max = Math.max(stats.positive, stats.neutral, stats.negative);
  if (max === stats.positive) return "Positive 😊";
  if (max === stats.neutral) return "Neutral 😐";
  return "Negative 😟";
}
