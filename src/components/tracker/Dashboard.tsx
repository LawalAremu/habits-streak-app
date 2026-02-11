import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, Sparkles, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Habit } from '@/types/habit';
import ProgressRing from './ProgressRing';
import HabitCard from './HabitCard';
import ConfettiEffect from './ConfettiEffect';

const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell" },
  { text: "You will never change your life until you change something you do daily.", author: "John C. Maxwell" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
];

interface DashboardProps {
  todayHabits: Habit[];
  todayProgress: number;
  todayCompletedCount: number;
  isCompleted: (habitId: string) => boolean;
  getStreak: (habitId: string) => number;
  toggleCompletion: (habitId: string) => void;
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onArchiveHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onNavigateToStats: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  todayHabits,
  todayProgress,
  todayCompletedCount,
  isCompleted,
  getStreak,
  toggleCompletion,
  onAddHabit,
  onEditHabit,
  onArchiveHabit,
  onDeleteHabit,
  onNavigateToStats,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  const handleToggle = useCallback((habitId: string) => {
    const wasCompleted = isCompleted(habitId);
    toggleCompletion(habitId);
    
    // Check if this completion makes all habits done
    if (!wasCompleted) {
      const willBeAllDone = todayHabits.every(h => h.id === habitId || isCompleted(h.id));
      if (willBeAllDone && todayHabits.length > 0) {
        setShowConfetti(true);
      }
    }
  }, [isCompleted, toggleCompletion, todayHabits]);

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      onDeleteHabit(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const allDone = todayProgress === 100 && todayHabits.length > 0;

  return (
    <div className="space-y-6">
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <ProgressRing percentage={todayProgress} size={160} strokeWidth={12}>
              <span className="text-4xl font-bold text-white">{todayProgress}%</span>
              <span className="text-xs text-white/70 font-medium">Complete</span>
            </ProgressRing>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-white/70 text-sm font-medium mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{greeting}!</h1>
            
            {allDone ? (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-lg font-semibold text-yellow-200">All habits completed today!</span>
              </div>
            ) : (
              <p className="text-white/80 mb-4">
                <span className="font-semibold text-white">{todayCompletedCount}</span> of{' '}
                <span className="font-semibold text-white">{todayHabits.length}</span> habits completed
              </p>
            )}

            {/* Quote */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-md">
              <p className="text-sm text-white/90 italic leading-relaxed">"{todayQuote.text}"</p>
              <p className="text-xs text-white/60 mt-1.5 font-medium">— {todayQuote.author}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onNavigateToStats}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayCompletedCount}/{todayHabits.length}</p>
        </button>
        <button
          onClick={onNavigateToStats}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayHabits.length}</p>
        </button>
        <button
          onClick={onNavigateToStats}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Best Streak</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {todayHabits.length > 0 ? Math.max(...todayHabits.map(h => getStreak(h.id)), 0) : 0}
          </p>
        </button>
      </div>

      {/* Habits List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Habits</h2>
          <button
            onClick={onAddHabit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>

        {todayHabits.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start Your Journey</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Build better habits, one day at a time. Add your first habit to begin tracking your discipline.
            </p>
            <button
              onClick={onAddHabit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={isCompleted(habit.id)}
                streak={getStreak(habit.id)}
                onToggle={() => handleToggle(habit.id)}
                onEdit={() => onEditHabit(habit)}
                onArchive={() => onArchiveHabit(habit.id)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* View Stats Link */}
      {todayHabits.length > 0 && (
        <button
          onClick={onNavigateToStats}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all font-medium"
        >
          View Detailed Statistics
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Dashboard;
