import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function MoodMap() {
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [error, setError] = useState("");

  function getAuthHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  const fetchAndComputeStats = async () => {
    try {
      const res = await fetch(`${API_URL}/chatwidoo/messages`, {
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        setError("Failed to load messages for MoodMap.");
        setStats({ positive: 0, neutral: 0, negative: 0 });
        return;
      }
      const data = await res.json();
      const messages = data.data?.messages || [];
      const counts = { positive: 0, neutral: 0, negative: 0 };
      messages.forEach((msg) => {
        if (msg.sentiment === "positive") counts.positive++;
        else if (msg.sentiment === "neutral") counts.neutral++;
        else if (msg.sentiment === "negative") counts.negative++;
      });
      setStats(counts);
      setError("");
    } catch (e) {
      setError("Network error. Please try again later.");
      setStats({ positive: 0, neutral: 0, negative: 0 });
    }
  };

  useEffect(() => {
    fetchAndComputeStats();
    // Optionally, listen for a custom event to refresh stats after chat update
    const handler = () => fetchAndComputeStats();
    window.addEventListener("chatUpdated", handler);
    return () => window.removeEventListener("chatUpdated", handler);
  }, []);

  const total = stats.positive + stats.neutral + stats.negative;

  const getOverallMood = () => {
    const max = Math.max(stats.positive, stats.neutral, stats.negative);
    if (max === stats.positive) return "Positive 😊";
    if (max === stats.neutral) return "Neutral 😐";
    return "Negative 😟";
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">MoodMap</h2>
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded border border-red-300 text-sm">{error}</div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg shadow-sm border border-green-200 dark:border-green-700">
          <span className="text-green-700 dark:text-green-300 font-medium text-lg">😊 Positive</span>
          <span className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.positive}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg shadow-sm border border-yellow-200 dark:border-yellow-700">
          <span className="text-yellow-700 dark:text-yellow-300 font-medium text-lg">😐 Neutral</span>
          <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{stats.neutral}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-sm border border-red-200 dark:border-red-700">
          <span className="text-red-700 dark:text-red-300 font-medium text-lg">😟 Negative</span>
          <span className="text-2xl font-bold text-red-800 dark:text-red-200">{stats.negative}</span>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
            Overall Mood:
          </p>
          <p className="text-2xl font-bold mt-1">
            {total === 0 ? "Neutral 😐" : getOverallMood()}
          </p>
        </div>
      </div>
    </div>
  );
}
