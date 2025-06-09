"use client"

import { useState, useEffect } from "react"
import { getScheduleData, getBusData, getCafeteriaData, getEventData, getFAQData } from "@/lib/data"

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<string>("")

  // Check online status and sync data
  useEffect(() => {
    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true)
      syncData()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial online check
    setIsOnline(navigator.onLine)

    // Initial data sync
    if (navigator.onLine) {
      syncData()
    } else {
      // Load from cache if offline
      loadFromCache()
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Sync data with "server" and cache it
  const syncData = () => {
    try {
      // In a real app, this would fetch from an API
      // For this demo, we'll just use our mock data
      const scheduleData = getScheduleData()
      const busData = getBusData()
      const cafeteriaData = getCafeteriaData()
      const eventData = getEventData()
      const faqData = getFAQData()

      // Cache the data
      localStorage.setItem("scheduleData", JSON.stringify(scheduleData))
      localStorage.setItem("busData", JSON.stringify(busData))
      localStorage.setItem("cafeteriaData", JSON.stringify(cafeteriaData))
      localStorage.setItem("eventData", JSON.stringify(eventData))
      localStorage.setItem("faqData", JSON.stringify(faqData))

      // Update last sync time
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      setLastSyncTime(timeString)
      localStorage.setItem("lastSyncTime", timeString)
    } catch (error) {
      console.error("Error syncing data:", error)
    }
  }

  // Load data from cache
  const loadFromCache = () => {
    try {
      // Get last sync time
      const cachedSyncTime = localStorage.getItem("lastSyncTime")
      if (cachedSyncTime) {
        setLastSyncTime(cachedSyncTime)
      }
    } catch (error) {
      console.error("Error loading from cache:", error)
    }
  }

  return {
    isOnline,
    lastSyncTime,
    syncData,
  }
}
