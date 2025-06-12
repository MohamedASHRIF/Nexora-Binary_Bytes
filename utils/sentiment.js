// File: frontend/src/utils/sentiment.js
export function analyzeSentiment(text) {
    const positiveWords = ["good", "great", "love", "awesome", "thank", "wow"];
    const negativeWords = ["bad", "hate", "angry", "sad", "late", "worst"];
    const textLower = text.toLowerCase();
    
    if (positiveWords.some(word => textLower.includes(word))) return "positive";
    if (negativeWords.some(word => textLower.includes(word))) return "negative";
    return "neutral";
  }