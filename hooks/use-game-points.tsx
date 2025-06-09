"use client"

import { useState, useEffect } from "react"

export function useGamePoints() {
  const [points, setPoints] = useState(0)
  const [badges, setBadges] = useState<string[]>([])

  // Load points and badges from localStorage on mount
  useEffect(() => {
    const storedPoints = localStorage.getItem("gamePoints")
    const storedBadges = localStorage.getItem("gameBadges")

    if (storedPoints) {
      setPoints(Number.parseInt(storedPoints, 10))
    }

    if (storedBadges) {
      setBadges(JSON.parse(storedBadges))
    }
  }, [])

  // Save points and badges to localStorage when they change
  useEffect(() => {
    localStorage.setItem("gamePoints", points.toString())
    localStorage.setItem("gameBadges", JSON.stringify(badges))

    // Check for new badges
    checkForNewBadges()
  }, [points])

  // Add points
  const addPoints = (amount: number) => {
    setPoints((prev) => prev + amount)
  }

  // Check for new badges based on points
  const checkForNewBadges = () => {
    const newBadges = [...badges]
    let badgeAdded = false

    // First interaction
    if (points >= 5 && !badges.includes("First Query")) {
      newBadges.push("First Query")
      badgeAdded = true
    }

    // Regular user
    if (points >= 50 && !badges.includes("Regular User")) {
      newBadges.push("Regular User")
      badgeAdded = true
    }

    // Power user
    if (points >= 100 && !badges.includes("Power User")) {
      newBadges.push("Power User")
      badgeAdded = true
    }

    // Campus Expert
    if (points >= 200 && !badges.includes("Campus Expert")) {
      newBadges.push("Campus Expert")
      badgeAdded = true
    }

    // Update badges if new ones were added
    if (badgeAdded) {
      setBadges(newBadges)
    }
  }

  return {
    points,
    badges,
    addPoints,
  }
}
