import React, { useState } from 'react';
import { Check, MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react';
import { Habit, CATEGORY_CONFIG } from '@/types/habit';
import StreakBadge from './StreakBadge';
import HabitIcon from './IconPicker';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completed,
  streak,
  onToggle,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const category = CATEGORY_CONFIG[habit.category];

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-lg ${
        completed
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
            completed
              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          } ${isAnimating ? 'scale-110' : 'scale-100'}`}
        >
          {completed && (
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          )}
          {isAnimating && completed && (
            <div className="absolute inset-0 rounded-xl animate-ping bg-emerald-400 opacity-30" />
          )}
        </button>

        {/* Icon & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${category.bgColor} ${category.darkBgColor}`}
              style={{ color: category.color }}
            >
              <HabitIcon name={habit.icon} className="w-4 h-4" />
            </div>
            <h3 className={`font-semibold text-base truncate ${
              completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
            }`}>
              {habit.name}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${category.color}15`, color: category.color }}
            >
              {category.label}
            </span>
            <StreakBadge streak={streak} compact />
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 overflow-hidden">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" /> Edit Habit
                </button>
                <button
                  onClick={() => { onArchive(); setShowMenu(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Archive className="w-4 h-4" /> Archive
                </button>
                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
