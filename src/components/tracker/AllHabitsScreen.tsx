import React, { useState, useMemo } from 'react';
import { Plus, Archive, Search, Filter, ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { Habit, HabitCategory, CATEGORY_CONFIG } from '@/types/habit';
import HabitIcon from './IconPicker';
import StreakBadge from './StreakBadge';

interface AllHabitsScreenProps {
  activeHabits: Habit[];
  archivedHabits: Habit[];
  getStreak: (habitId: string) => number;
  getHabitStats: (habitId: string) => { completionRate: number; totalCompletions: number; currentStreak: number; longestStreak: number };
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onArchiveHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onBack: () => void;
}

const AllHabitsScreen: React.FC<AllHabitsScreenProps> = ({
  activeHabits,
  archivedHabits,
  getStreak,
  getHabitStats,
  onAddHabit,
  onEditHabit,
  onArchiveHabit,
  onDeleteHabit,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const displayedHabits = useMemo(() => {
    const habits = showArchived ? archivedHabits : activeHabits;
    return habits.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeHabits, archivedHabits, showArchived, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(activeHabits.map(h => h.category));
    return ['all' as const, ...Array.from(cats)] as (HabitCategory | 'all')[];
  }, [activeHabits]);

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      onDeleteHabit(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Habits</h1>
        </div>
        <button
          onClick={onAddHabit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search habits..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Tabs & Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            !showArchived
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          Active ({activeHabits.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            showArchived
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          Archived ({archivedHabits.length})
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat].label}
          </button>
        ))}
      </div>

      {/* Habits List */}
      {displayedHabits.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No habits match your search.' : showArchived ? 'No archived habits.' : 'No habits yet. Create one!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedHabits.map(habit => {
            const cat = CATEGORY_CONFIG[habit.category];
            const stats = getHabitStats(habit.id);
            const streak = getStreak(habit.id);
            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <HabitIcon name={habit.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{habit.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{cat.label}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{habit.schedule}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{stats.completionRate}% rate</span>
                    </div>
                  </div>
                  <StreakBadge streak={streak} compact />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-xs font-medium"
                    >
                      Edit
                    </button>
                    {showArchived ? (
                      <button
                        onClick={() => onArchiveHabit(habit.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onArchiveHabit(habit.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        deleteConfirmId === habit.id
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={deleteConfirmId === habit.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllHabitsScreen;
