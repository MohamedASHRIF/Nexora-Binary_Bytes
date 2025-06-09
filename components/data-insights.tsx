"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useQueryLogs } from "@/hooks/use-query-logs"

export default function DataInsights() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day")
  const { queryStats, sentimentStats, popularQueries } = useQueryLogs(timeRange)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Data Insights</h2>
        <div className="flex border rounded-md overflow-hidden">
          <button
            className={`px-3 py-1 text-sm ${timeRange === "day" ? "bg-purple-600 text-white" : "bg-transparent"}`}
            onClick={() => setTimeRange("day")}
          >
            Day
          </button>
          <button
            className={`px-3 py-1 text-sm ${timeRange === "week" ? "bg-purple-600 text-white" : "bg-transparent"}`}
            onClick={() => setTimeRange("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 text-sm ${timeRange === "month" ? "bg-purple-600 text-white" : "bg-transparent"}`}
            onClick={() => setTimeRange("month")}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Query Volume</h3>
          <div className="text-3xl font-bold">{queryStats.total}</div>
          <div className="text-xs text-gray-500">
            {queryStats.trend > 0 ? "↑" : "↓"} {Math.abs(queryStats.trend)}% from previous period
          </div>

          <div className="mt-4 h-32 flex items-end gap-1">
            {queryStats.hourly.map((value, i) => (
              <div
                key={i}
                className="bg-purple-600 w-full rounded-t"
                style={{ height: `${(value / Math.max(...queryStats.hourly)) * 100}%` }}
              ></div>
            ))}
          </div>
          <div className="text-xs text-center mt-1">Hourly distribution</div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Sentiment Analysis</h3>
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{sentimentStats.positive}%</div>
              <div className="text-xs">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{sentimentStats.neutral}%</div>
              <div className="text-xs">Neutral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{sentimentStats.negative}%</div>
              <div className="text-xs">Negative</div>
            </div>
          </div>

          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{
                width: `${sentimentStats.positive + sentimentStats.neutral + sentimentStats.negative}%`,
                backgroundSize: `${100 * 3}% 100%`,
              }}
            ></div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-medium mb-1">Sentiment Trend</h4>
            <div className="h-24 flex items-center">
              <svg viewBox="0 0 100 50" width="100%" height="100%" preserveAspectRatio="none">
                <path
                  d="M0,25 L10,20 L20,30 L30,15 L40,25 L50,10 L60,20 L70,15 L80,25 L90,5 L100,15"
                  fill="none"
                  stroke="purple"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Popular Queries</h3>
          <ul className="space-y-2">
            {popularQueries.map((query, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-sm truncate">{query.text}</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">
                  {query.count}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <h4 className="text-xs font-medium mb-1">Query Categories</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Schedule</span>
                  <span>35%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Bus</span>
                  <span>25%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Cafeteria</span>
                  <span>20%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: "20%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Events</span>
                  <span>15%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: "15%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Other</span>
                  <span>5%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: "5%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
