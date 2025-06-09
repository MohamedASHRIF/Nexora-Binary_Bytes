// Simple sentiment analysis function
export function analyzeSentiment(text: string): number {
  // This is a very simplified version of sentiment analysis
  // In a real app, you would use a proper NLP library

  const positiveWords = [
    "good",
    "great",
    "excellent",
    "awesome",
    "amazing",
    "love",
    "happy",
    "thanks",
    "thank",
    "helpful",
    "nice",
    "perfect",
    "wonderful",
  ]

  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "hate",
    "dislike",
    "wrong",
    "error",
    "problem",
    "issue",
    "broken",
    "not working",
    "disappointed",
    "late",
    "missed",
    "fail",
    "poor",
    "slow",
    "annoying",
    "frustrating",
  ]

  const words = text.toLowerCase().split(/\W+/)

  let score = 0

  words.forEach((word) => {
    if (positiveWords.includes(word)) {
      score += 0.2
    } else if (negativeWords.includes(word)) {
      score -= 0.2
    }
  })

  // Clamp score between -1 and 1
  return Math.max(-1, Math.min(1, score))
}

// Extract intent from text
export function extractIntent(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes("schedule") || lowerText.includes("class")) {
    return "schedule"
  } else if (lowerText.includes("bus") || lowerText.includes("shuttle")) {
    return "bus"
  } else if (lowerText.includes("cafeteria") || lowerText.includes("food") || lowerText.includes("menu")) {
    return "cafeteria"
  } else if (lowerText.includes("event") || lowerText.includes("happening")) {
    return "event"
  } else if (lowerText.includes("where") || lowerText.includes("location") || lowerText.includes("find")) {
    return "location"
  } else {
    return "general"
  }
}
