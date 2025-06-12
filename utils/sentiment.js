// File: frontend/src/utils/sentiment.js

export function analyzeSentiment(text) {
    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "perfect",
      "happy", "pleased", "satisfied", "helpful", "thanks", "thank", "awesome",
      "fantastic", "brilliant", "love", "like", "nice", "wow"
    ];
  
    const negativeWords = [
      "bad", "terrible", "awful", "horrible", "poor", "wrong",
      "sad", "angry", "upset", "disappointed", "frustrated", "hate",
      "dislike", "problem", "issue", "error", "fail", "broken", "late", "worst"
    ];
  
    const words = text.toLowerCase().split(/\s+/).map(word => word.replace(/[^\w]/g, ''));
    let score = 0;
  
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      else if (negativeWords.includes(word)) score -= 1;
    });
  
    if (score > 0) return "positive";
    if (score < 0) return "negative";
    return "neutral";
  }
  