import React from 'react';
import { useGamification } from '../hooks/use-gamification';

export const UserProgress: React.FC = () => {
  const { progress, getUnlockedBadges, getUnlockedAchievements } = useGamification();
  const unlockedBadges = getUnlockedBadges();
  const unlockedAchievements = getUnlockedAchievements();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
        <div className="mt-2">
          <span className="text-4xl font-bold text-blue-600">{progress.points}</span>
          <span className="text-gray-600 ml-2">points</span>
        </div>
        <div className="mt-1">
          <span className="text-lg text-gray-600">Level {progress.level}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Badges</h3>
        <div className="grid grid-cols-2 gap-4">
          {progress.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border ${
                badge.unlocked
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-medium text-gray-800">{badge.name}</div>
              <div className="text-sm text-gray-600">{badge.description}</div>
              {badge.unlocked && (
                <div className="mt-2 text-sm text-blue-600">+{badge.points} points</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Achievements</h3>
        <div className="space-y-3">
          {progress.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.unlocked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="font-medium text-gray-800">{achievement.name}</div>
              <div className="text-sm text-gray-600">{achievement.description}</div>
              {achievement.unlocked && (
                <div className="mt-2 text-sm text-green-600">+{achievement.points} points</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600">
          {progress.points % 1000} / 1000 points to next level
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(progress.points % 1000) / 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}; 