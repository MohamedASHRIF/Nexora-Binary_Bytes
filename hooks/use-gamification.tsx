import { useState, useCallback, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
}

interface UserProgress {
  points: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Check your schedule first thing in the morning',
    icon: '🌅',
    points: 50,
    unlocked: false
  },
  {
    id: 'bus_master',
    name: 'Bus Master',
    description: 'Check bus schedules 5 times',
    icon: '🚌',
    points: 100,
    unlocked: false
  },
  {
    id: 'foodie',
    name: 'Foodie',
    description: 'Check cafeteria menu 3 times',
    icon: '🍽️',
    points: 75,
    unlocked: false
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Check events 5 times',
    icon: '🦋',
    points: 150,
    unlocked: false
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_query',
    name: 'First Query',
    description: 'Ask your first question',
    points: 25,
    unlocked: false
  },
  {
    id: 'schedule_master',
    name: 'Schedule Master',
    description: 'Check your schedule 10 times',
    points: 200,
    unlocked: false
  },
  {
    id: 'language_explorer',
    name: 'Language Explorer',
    description: 'Try all available languages',
    points: 150,
    unlocked: false
  }
];

const POINTS_PER_LEVEL = 1000;

export const useGamification = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('userProgress');
    return saved ? JSON.parse(saved) : {
      points: 0,
      level: 1,
      badges: INITIAL_BADGES,
      achievements: INITIAL_ACHIEVEMENTS
    };
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(progress));
  }, [progress]);

  const addPoints = useCallback((points: number) => {
    setProgress(prev => {
      const newPoints = prev.points + points;
      const newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;
      
      return {
        ...prev,
        points: newPoints,
        level: newLevel
      };
    });
  }, []);

  const checkAndAwardBadges = useCallback((action: string) => {
    setProgress(prev => {
      const newBadges = [...prev.badges];
      let pointsEarned = 0;

      switch (action) {
        case 'check_schedule_morning':
          const earlyBirdBadge = newBadges.find(b => b.id === 'early_bird');
          if (earlyBirdBadge && !earlyBirdBadge.unlocked) {
            earlyBirdBadge.unlocked = true;
            pointsEarned += earlyBirdBadge.points;
          }
          break;
        case 'check_bus':
          const busMasterBadge = newBadges.find(b => b.id === 'bus_master');
          if (busMasterBadge && !busMasterBadge.unlocked) {
            busMasterBadge.unlocked = true;
            pointsEarned += busMasterBadge.points;
          }
          break;
        case 'check_menu':
          const foodieBadge = newBadges.find(b => b.id === 'foodie');
          if (foodieBadge && !foodieBadge.unlocked) {
            foodieBadge.unlocked = true;
            pointsEarned += foodieBadge.points;
          }
          break;
        case 'check_events':
          const socialButterflyBadge = newBadges.find(b => b.id === 'social_butterfly');
          if (socialButterflyBadge && !socialButterflyBadge.unlocked) {
            socialButterflyBadge.unlocked = true;
            pointsEarned += socialButterflyBadge.points;
          }
          break;
      }

      if (pointsEarned > 0) {
        return {
          ...prev,
          badges: newBadges,
          points: prev.points + pointsEarned
        };
      }

      return prev;
    });
  }, []);

  const checkAndAwardAchievements = useCallback((action: string) => {
    setProgress(prev => {
      const newAchievements = [...prev.achievements];
      let pointsEarned = 0;

      switch (action) {
        case 'first_query':
          const firstQueryAchievement = newAchievements.find(a => a.id === 'first_query');
          if (firstQueryAchievement && !firstQueryAchievement.unlocked) {
            firstQueryAchievement.unlocked = true;
            pointsEarned += firstQueryAchievement.points;
          }
          break;
        case 'schedule_master':
          const scheduleMasterAchievement = newAchievements.find(a => a.id === 'schedule_master');
          if (scheduleMasterAchievement && !scheduleMasterAchievement.unlocked) {
            scheduleMasterAchievement.unlocked = true;
            pointsEarned += scheduleMasterAchievement.points;
          }
          break;
        case 'language_explorer':
          const languageExplorerAchievement = newAchievements.find(a => a.id === 'language_explorer');
          if (languageExplorerAchievement && !languageExplorerAchievement.unlocked) {
            languageExplorerAchievement.unlocked = true;
            pointsEarned += languageExplorerAchievement.points;
          }
          break;
      }

      if (pointsEarned > 0) {
        return {
          ...prev,
          achievements: newAchievements,
          points: prev.points + pointsEarned
        };
      }

      return prev;
    });
  }, []);

  const getUnlockedBadges = useCallback(() => {
    return progress.badges.filter(badge => badge.unlocked);
  }, [progress.badges]);

  const getUnlockedAchievements = useCallback(() => {
    return progress.achievements.filter(achievement => achievement.unlocked);
  }, [progress.achievements]);

  return {
    progress,
    addPoints,
    checkAndAwardBadges,
    checkAndAwardAchievements,
    getUnlockedBadges,
    getUnlockedAchievements
  };
}; 