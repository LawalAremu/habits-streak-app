import React from 'react';
import { Flame, Trophy, Zap, Crown } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, compact = false }) => {
  if (streak === 0) return null;

  const getMilestone = () => {
    if (streak >= 100) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Legendary' };
    if (streak >= 30) return { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Champion' };
    if (streak >= 7) return { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'On Fire' };
    return { icon: Flame, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Streak' };
  };

  const milestone = getMilestone();
  const Icon = milestone.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${milestone.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {streak}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${milestone.bg}`}>
      <Icon className={`w-4 h-4 ${milestone.color}`} />
      <span className={`text-sm font-bold ${milestone.color}`}>{streak}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{streak === 1 ? 'day' : 'days'}</span>
    </div>
  );
};

export default StreakBadge;
