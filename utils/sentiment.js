// File: frontend/src/utils/logger.js
let queryLog = [];

export function logQuery(message) {
  queryLog.push(message);
}

export function getSentimentStats() {
  const stats = { positive: 0, neutral: 0, negative: 0 };
  queryLog.forEach(msg => {
    stats[msg.sentiment]++;
  });
  return stats;
}