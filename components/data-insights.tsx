"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useUserInsights } from "@/hooks/use-user-insights"

export default function DataInsights() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day")
  const { queryStats, sentimentStats, popularQueries, isLoading, error } = useUserInsights(timeRange)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Data Insights</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 dark:border-purple-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your insights...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Data Insights</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 dark:text-red-300 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Insights</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Data Insights</h2>
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
          <button
            className={`px-3 py-1 text-sm transition-colors ${
              timeRange === "day" 
                ? "bg-purple-600 dark:bg-purple-500 text-white" 
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setTimeRange("day")}
          >
            Day
          </button>
          <button
            className={`px-3 py-1 text-sm transition-colors ${
              timeRange === "week" 
                ? "bg-purple-600 dark:bg-purple-500 text-white" 
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setTimeRange("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 text-sm transition-colors ${
              timeRange === "month" 
                ? "bg-purple-600 dark:bg-purple-500 text-white" 
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setTimeRange("month")}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Your Query Volume</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{queryStats.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {queryStats.trend > 0 ? "↑" : "↓"} {Math.abs(queryStats.trend)}% from previous period
          </div>

          <div className="mt-4 h-32 flex items-end gap-1">
            {queryStats.hourly.map((value, i) => (
              <div
                key={i}
                className="bg-purple-600 dark:bg-purple-400 w-full rounded-t"
                style={{ height: `${(value / Math.max(...queryStats.hourly)) * 100}%` }}
              ></div>
            ))}
          </div>
          <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">Hourly distribution</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Your Sentiment Analysis</h3>
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 dark:text-green-400">{sentimentStats.positive}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">{sentimentStats.neutral}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Neutral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">{sentimentStats.negative}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Negative</div>
            </div>
          </div>

          <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{
                width: `${sentimentStats.positive + sentimentStats.neutral + sentimentStats.negative}%`,
                backgroundSize: `${100 * 3}% 100%`,
              }}
            ></div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Sentiment Trend</h4>
            <div className="h-24 flex items-center">
              <svg viewBox="0 0 100 50" width="100%" height="100%" preserveAspectRatio="none">
                <path
                  d="M0,25 L10,20 L20,30 L30,15 L40,25 L50,10 L60,20 L70,15 L80,25 L90,5 L100,15"
                  fill="none"
                  stroke="rgb(147, 51, 234)"
                  strokeWidth="2"
                  className="dark:stroke-purple-400"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Your Popular Queries</h3>
          <ul className="space-y-2">
            {popularQueries.map((query, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-sm truncate text-gray-700 dark:text-gray-300">{query.text}</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">
                  {query.count}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <h4 className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Query Categories</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Schedule</span>
                  <span className="text-gray-600 dark:text-gray-400">35%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 dark:bg-purple-400" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Bus</span>
                  <span className="text-gray-600 dark:text-gray-400">25%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 dark:bg-purple-400" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Cafeteria</span>
                  <span className="text-gray-600 dark:text-gray-400">20%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 dark:bg-purple-400" style={{ width: "20%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Events</span>
                  <span className="text-gray-600 dark:text-gray-400">15%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 dark:bg-purple-400" style={{ width: "15%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Other</span>
                  <span className="text-gray-600 dark:text-gray-400">5%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 dark:bg-purple-400" style={{ width: "5%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
