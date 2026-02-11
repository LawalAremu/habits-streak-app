export type HabitCategory = 'health' | 'productivity' | 'mindfulness' | 'fitness' | 'learning' | 'social' | 'custom';

export type ScheduleType = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  color: string;
  icon: string;
  schedule: ScheduleType;
  customDays?: number[]; // 0=Sun, 1=Mon, etc.
  reminderTime?: string; // HH:mm format
  reminderEnabled: boolean;
  createdAt: string;
  archived: boolean;
  order: number;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completedAt: string;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

export interface DayData {
  date: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export const CATEGORY_CONFIG: Record<HabitCategory, { label: string; color: string; bgColor: string; darkBgColor: string }> = {
  health: { label: 'Health', color: '#10B981', bgColor: 'bg-emerald-100', darkBgColor: 'dark:bg-emerald-900/30' },
  productivity: { label: 'Productivity', color: '#3B82F6', bgColor: 'bg-blue-100', darkBgColor: 'dark:bg-blue-900/30' },
  mindfulness: { label: 'Mindfulness', color: '#8B5CF6', bgColor: 'bg-violet-100', darkBgColor: 'dark:bg-violet-900/30' },
  fitness: { label: 'Fitness', color: '#F59E0B', bgColor: 'bg-amber-100', darkBgColor: 'dark:bg-amber-900/30' },
  learning: { label: 'Learning', color: '#EC4899', bgColor: 'bg-pink-100', darkBgColor: 'dark:bg-pink-900/30' },
  social: { label: 'Social', color: '#06B6D4', bgColor: 'bg-cyan-100', darkBgColor: 'dark:bg-cyan-900/30' },
  custom: { label: 'Custom', color: '#F97316', bgColor: 'bg-orange-100', darkBgColor: 'dark:bg-orange-900/30' },
};

export const HABIT_ICONS = [
  'Droplets', 'Dumbbell', 'BookOpen', 'Brain', 'Heart', 'Sun',
  'Moon', 'Coffee', 'Apple', 'Bike', 'Footprints', 'Pencil',
  'Music', 'Leaf', 'Flame', 'Target', 'Clock', 'Smile',
  'Zap', 'Star', 'Trophy', 'Gem', 'Sparkles', 'Shield',
];

export const HABIT_TEMPLATES: Omit<Habit, 'id' | 'createdAt' | 'order'>[] = [
  { name: 'Drink 8 glasses of water', category: 'health', color: '#10B981', icon: 'Droplets', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Morning workout', category: 'fitness', color: '#F59E0B', icon: 'Dumbbell', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Read for 30 minutes', category: 'learning', color: '#EC4899', icon: 'BookOpen', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Meditate 10 minutes', category: 'mindfulness', color: '#8B5CF6', icon: 'Brain', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Journal before bed', category: 'mindfulness', color: '#8B5CF6', icon: 'Pencil', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Take a walk', category: 'fitness', color: '#F59E0B', icon: 'Footprints', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'No social media before noon', category: 'productivity', color: '#3B82F6', icon: 'Shield', schedule: 'weekdays', reminderEnabled: false, archived: false },
  { name: 'Practice gratitude', category: 'mindfulness', color: '#8B5CF6', icon: 'Heart', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Eat a healthy breakfast', category: 'health', color: '#10B981', icon: 'Apple', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Deep work session', category: 'productivity', color: '#3B82F6', icon: 'Target', schedule: 'weekdays', reminderEnabled: false, archived: false },
  { name: 'Learn something new', category: 'learning', color: '#EC4899', icon: 'Sparkles', schedule: 'daily', reminderEnabled: false, archived: false },
  { name: 'Call a friend or family', category: 'social', color: '#06B6D4', icon: 'Smile', schedule: 'weekends', reminderEnabled: false, archived: false },
];
