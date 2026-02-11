import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, isToday, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns';
import { Habit, HabitCompletion, HabitStats, DayData } from '@/types/habit';

const HABITS_KEY = 'discipline_tracker_habits';
const COMPLETIONS_KEY = 'discipline_tracker_completions';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => loadFromStorage(HABITS_KEY, []));
  const [completions, setCompletions] = useState<HabitCompletion[]>(() => loadFromStorage(COMPLETIONS_KEY, []));

  // Persist to localStorage
  useEffect(() => { saveToStorage(HABITS_KEY, habits); }, [habits]);
  useEffect(() => { saveToStorage(COMPLETIONS_KEY, completions); }, [completions]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const activeHabits = useMemo(() =>
    habits.filter(h => !h.archived).sort((a, b) => a.order - b.order),
    [habits]
  );

  const archivedHabits = useMemo(() =>
    habits.filter(h => h.archived),
    [habits]
  );

  const isHabitScheduledForDate = useCallback((habit: Habit, dateStr: string): boolean => {
    const date = parseISO(dateStr);
    const dayOfWeek = date.getDay();
    switch (habit.schedule) {
      case 'daily': return true;
      case 'weekdays': return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekends': return dayOfWeek === 0 || dayOfWeek === 6;
      case 'custom': return habit.customDays?.includes(dayOfWeek) ?? true;
      default: return true;
    }
  }, []);

  const todayHabits = useMemo(() =>
    activeHabits.filter(h => isHabitScheduledForDate(h, today)),
    [activeHabits, today, isHabitScheduledForDate]
  );

  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      order: habits.length,
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, [habits.length]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletions(prev => prev.filter(c => c.habitId !== id));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: !h.archived } : h));
  }, []);

  const toggleCompletion = useCallback((habitId: string, date?: string) => {
    const targetDate = date || today;
    const existing = completions.find(c => c.habitId === habitId && c.date === targetDate);
    if (existing) {
      setCompletions(prev => prev.filter(c => !(c.habitId === habitId && c.date === targetDate)));
    } else {
      setCompletions(prev => [...prev, {
        habitId,
        date: targetDate,
        completedAt: new Date().toISOString(),
      }]);
    }
  }, [completions, today]);

  const isCompleted = useCallback((habitId: string, date?: string) => {
    const targetDate = date || today;
    return completions.some(c => c.habitId === habitId && c.date === targetDate);
  }, [completions, today]);

  const getStreak = useCallback((habitId: string): number => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    let streak = 0;
    let checkDate = new Date();

    // If not completed today, start checking from yesterday
    if (!isCompleted(habitId, format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = subDays(checkDate, 1);
    }

    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      // Skip days when habit isn't scheduled
      if (!isHabitScheduledForDate(habit, dateStr)) {
        checkDate = subDays(checkDate, 1);
        if (differenceInCalendarDays(new Date(), checkDate) > 365) break;
        continue;
      }

      if (isCompleted(habitId, dateStr)) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }

      if (differenceInCalendarDays(new Date(), checkDate) > 365) break;
    }

    return streak;
  }, [habits, isCompleted, isHabitScheduledForDate]);

  const getLongestStreak = useCallback((habitId: string): number => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const habitCompletions = completions
      .filter(c => c.habitId === habitId)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (habitCompletions.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < habitCompletions.length; i++) {
      const prevDate = parseISO(habitCompletions[i - 1].date);
      const currDate = parseISO(habitCompletions[i].date);
      const diff = differenceInCalendarDays(currDate, prevDate);

      if (diff === 1) {
        current++;
        longest = Math.max(longest, current);
      } else if (diff > 1) {
        current = 1;
      }
    }

    return longest;
  }, [habits, completions]);

  const getHabitStats = useCallback((habitId: string): HabitStats => {
    const habitCompletions = completions.filter(c => c.habitId === habitId);
    const habit = habits.find(h => h.id === habitId);
    
    let scheduledDays = 0;
    if (habit) {
      for (let i = 0; i < 30; i++) {
        const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (isHabitScheduledForDate(habit, dateStr)) {
          scheduledDays++;
        }
      }
    }

    const last30Completions = habitCompletions.filter(c => {
      const diff = differenceInCalendarDays(new Date(), parseISO(c.date));
      return diff >= 0 && diff < 30;
    }).length;

    return {
      habitId,
      currentStreak: getStreak(habitId),
      longestStreak: getLongestStreak(habitId),
      totalCompletions: habitCompletions.length,
      completionRate: scheduledDays > 0 ? Math.round((last30Completions / scheduledDays) * 100) : 0,
    };
  }, [completions, habits, getStreak, getLongestStreak, isHabitScheduledForDate]);

  const todayProgress = useMemo(() => {
    if (todayHabits.length === 0) return 0;
    const completed = todayHabits.filter(h => isCompleted(h.id)).length;
    return Math.round((completed / todayHabits.length) * 100);
  }, [todayHabits, isCompleted]);

  const todayCompletedCount = useMemo(() =>
    todayHabits.filter(h => isCompleted(h.id)).length,
    [todayHabits, isCompleted]
  );

  const getWeekData = useCallback((): DayData[] => {
    const data: DayData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const scheduledHabits = activeHabits.filter(h => isHabitScheduledForDate(h, dateStr));
      const completedCount = scheduledHabits.filter(h => isCompleted(h.id, dateStr)).length;
      data.push({
        date: dateStr,
        completedCount,
        totalCount: scheduledHabits.length,
        percentage: scheduledHabits.length > 0 ? Math.round((completedCount / scheduledHabits.length) * 100) : 0,
      });
    }
    return data;
  }, [activeHabits, isHabitScheduledForDate, isCompleted]);

  const getMonthData = useCallback((): DayData[] => {
    const data: DayData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const scheduledHabits = activeHabits.filter(h => isHabitScheduledForDate(h, dateStr));
      const completedCount = scheduledHabits.filter(h => isCompleted(h.id, dateStr)).length;
      data.push({
        date: dateStr,
        completedCount,
        totalCount: scheduledHabits.length,
        percentage: scheduledHabits.length > 0 ? Math.round((completedCount / scheduledHabits.length) * 100) : 0,
      });
    }
    return data;
  }, [activeHabits, isHabitScheduledForDate, isCompleted]);

  const exportData = useCallback(() => {
    const data = { habits, completions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discipline-tracker-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [habits, completions, today]);

  const importData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.habits && data.completions) {
        setHabits(data.habits);
        setCompletions(data.completions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setHabits([]);
    setCompletions([]);
    localStorage.removeItem(HABITS_KEY);
    localStorage.removeItem(COMPLETIONS_KEY);
  }, []);

  // Methods for cloud sync restore
  const setHabitsData = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits);
  }, []);

  const setCompletionsData = useCallback((newCompletions: HabitCompletion[]) => {
    setCompletions(newCompletions);
  }, []);

  return {
    habits,
    activeHabits,
    archivedHabits,
    completions,
    todayHabits,
    todayProgress,
    todayCompletedCount,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    toggleCompletion,
    isCompleted,
    getStreak,
    getLongestStreak,
    getHabitStats,
    getWeekData,
    getMonthData,
    exportData,
    importData,
    clearAllData,
    isHabitScheduledForDate,
    setHabitsData,
    setCompletionsData,
  };
}
