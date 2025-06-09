interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
}

const positiveWords = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect',
  'happy', 'pleased', 'satisfied', 'helpful', 'thanks', 'thank you',
  'awesome', 'fantastic', 'brilliant', 'love', 'like', 'nice',
]);

const negativeWords = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'wrong',
  'sad', 'angry', 'upset', 'disappointed', 'frustrated', 'hate',
  'dislike', 'problem', 'issue', 'error', 'fail', 'broken',
]);

export const analyzeSentiment = (text: string): SentimentResult => {
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.has(word)) {
      score += 1;
    } else if (negativeWords.has(word)) {
      score -= 1;
    }
  });

  let label: 'positive' | 'negative' | 'neutral';
  if (score > 0) {
    label = 'positive';
  } else if (score < 0) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  return {
    score,
    label,
  };
};

// Example usage:
// const result = analyzeSentiment('This is a great service!');
// console.log(result); // { score: 1, label: 'positive' } 