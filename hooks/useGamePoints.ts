import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
}

const BADGES: Badge[] = [
  {
    id: 'newbie',
    name: 'Newbie',
    description: 'First interaction with the copilot',
    pointsRequired: 0,
  },
  {
    id: 'regular',
    name: 'Regular User',
    description: 'Used the copilot 10 times',
    pointsRequired: 50,
  },
  {
    id: 'expert',
    name: 'Campus Expert',
    description: 'Used all features of the copilot',
    pointsRequired: 100,
  },
];

export const useGamePoints = () => {
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const storedPoints = localStorage.getItem('gamePoints');
      const storedBadges = localStorage.getItem('badges');
      
      if (storedPoints) {
        setPoints(parseInt(storedPoints, 10));
      }
      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save to localStorage when points or badges change
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('gamePoints', points.toString());
      localStorage.setItem('badges', JSON.stringify(badges));
    }
  }, [points, badges, isInitialized]);

  const addPoints = (amount: number) => {
    setPoints(prev => {
      const newPoints = prev + amount;
      
      // Check for new badges
      const newBadges = BADGES.filter(
        badge => badge.pointsRequired <= newPoints && !badges.includes(badge.id)
      ).map(badge => badge.id);

      if (newBadges.length > 0) {
        setBadges(prev => [...prev, ...newBadges]);
      }

      return newPoints;
    });
  };

  const getEarnedBadges = () => {
    return BADGES.filter(badge => badges.includes(badge.id));
  };

  const getNextBadge = () => {
    return BADGES.find(badge => !badges.includes(badge.id));
  };

  return {
    points,
    badges: getEarnedBadges(),
    nextBadge: getNextBadge(),
    addPoints,
  };
}; 