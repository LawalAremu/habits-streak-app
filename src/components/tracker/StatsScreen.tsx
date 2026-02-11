import React, { useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Flame, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { Habit, CATEGORY_CONFIG } from '@/types/habit';
import { DayData } from '@/types/habit';
import HabitIcon from './IconPicker';
import StreakBadge from './StreakBadge';

interface StatsScreenProps {
  activeHabits: Habit[];
  getHabitStats: (habitId: string) => { currentStreak: number; longestStreak: number; totalCompletions: number; completionRate: number };
  getWeekData: () => DayData[];
  getMonthData: () => DayData[];
  isCompleted: (habitId: string, date?: string) => boolean;
  getStreak: (habitId: string) => number;
  onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({
  activeHabits,
  getHabitStats,
  getWeekData,
  getMonthData,
  isCompleted,
  getStreak,
  onBack,
}) => {
  const weekData = useMemo(() => getWeekData(), [getWeekData]);
  const monthData = useMemo(() => getMonthData(), [getMonthData]);

  const overallStats = useMemo(() => {
    const allStats = activeHabits.map(h => getHabitStats(h.id));
    const avgCompletionRate = allStats.length > 0
      ? Math.round(allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length)
      : 0;
    const totalCompletions = allStats.reduce((sum, s) => sum + s.totalCompletions, 0);
    const bestStreak = allStats.length > 0 ? Math.max(...allStats.map(s => s.longestStreak)) : 0;
    const currentBestStreak = allStats.length > 0 ? Math.max(...allStats.map(s => s.currentStreak)) : 0;
    return { avgCompletionRate, totalCompletions, bestStreak, currentBestStreak };
  }, [activeHabits, getHabitStats]);

  const weekChartData = useMemo(() =>
    weekData.map(d => ({
      day: format(parseISO(d.date), 'EEE'),
      completed: d.completedCount,
      total: d.totalCount,
      percentage: d.percentage,
    })),
    [weekData]
  );

  const monthChartData = useMemo(() =>
    monthData.map(d => ({
      date: format(parseISO(d.date), 'MMM d'),
      percentage: d.percentage,
    })),
    [monthData]
  );

  // Build heatmap for last 5 weeks, aligned to day of week
  const heatmapData = useMemo(() => {
    const today = new Date();
    const todayDow = today.getDay(); // 0=Sun
    // Go back to find the start of the grid (5 full weeks ending on today's row)
    const totalDays = 35;
    const startOffset = totalDays - 1 - todayDow; // days before today to start at Sunday of first week
    
    const data: { date: string; percentage: number; dayLabel: string; isEmpty: boolean }[] = [];
    
    for (let i = startOffset; i >= -todayDow; i--) {
      // We iterate from oldest to newest
    }
    
    // Simpler approach: just show last 35 days in a grid, no day alignment
    for (let i = 34; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = monthData.find(d => d.date === dateStr);
      data.push({
        date: dateStr,
        percentage: dayData?.percentage || 0,
        dayLabel: format(date, 'd'),
        isEmpty: false,
      });
    }
    return data;
  }, [monthData]);

  const getHeatmapColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (percentage < 25) return 'bg-indigo-100 dark:bg-indigo-900/30';
    if (percentage < 50) return 'bg-indigo-200 dark:bg-indigo-800/40';
    if (percentage < 75) return 'bg-indigo-300 dark:bg-indigo-700/50';
    if (percentage < 100) return 'bg-indigo-400 dark:bg-indigo-600/60';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const habitRankings = useMemo(() =>
    activeHabits
      .map(h => ({ habit: h, stats: getHabitStats(h.id), streak: getStreak(h.id) }))
      .sort((a, b) => b.stats.completionRate - a.stats.completionRate),
    [activeHabits, getHabitStats, getStreak]
  );

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-20">
        <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Stats Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Add some habits and start tracking to see your statistics.</p>
        <button onClick={onBack} className="mt-4 px-6 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-200" />
            <span className="text-xs text-indigo-200 font-medium">Avg Rate</span>
          </div>
          <p className="text-3xl font-bold">{overallStats.avgCompletionRate}%</p>
          <p className="text-xs text-indigo-200 mt-1">Last 30 days</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-200" />
            <span className="text-xs text-emerald-200 font-medium">Total Done</span>
          </div>
          <p className="text-3xl font-bold">{overallStats.totalCompletions}</p>
          <p className="text-xs text-emerald-200 mt-1">All time</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-amber-200" />
            <span className="text-xs text-amber-200 font-medium">Current Best</span>
          </div>
          <p className="text-3xl font-bold">{overallStats.currentBestStreak}</p>
          <p className="text-xs text-amber-200 mt-1">Day streak</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-purple-200" />
            <span className="text-xs text-purple-200 font-medium">Best Ever</span>
          </div>
          <p className="text-3xl font-bold">{overallStats.bestStreak}</p>
          <p className="text-xs text-purple-200 mt-1">Day streak</p>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          This Week
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekChartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number, name: string) => [value, name === 'completed' ? 'Completed' : 'Total']}
              />
              <Bar dataKey="total" fill="#E5E7EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          30-Day Trend
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthChartData}>
              <defs>
                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value}%`, 'Completion']}
              />
              <Area type="monotone" dataKey="percentage" stroke="#6366F1" strokeWidth={2.5} fill="url(#colorPercentage)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Activity Heatmap — Last 35 Days</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmapData.map((d, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md ${getHeatmapColor(d.percentage)} transition-colors relative group cursor-default`}
              title={`${format(parseISO(d.date), 'MMM d')} — ${d.percentage}%`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.dayLabel}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-3">
          <span className="text-xs text-gray-400 mr-1">Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-indigo-200 dark:bg-indigo-800/40" />
          <div className="w-3 h-3 rounded-sm bg-indigo-300 dark:bg-indigo-700/50" />
          <div className="w-3 h-3 rounded-sm bg-indigo-400 dark:bg-indigo-600/60" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-xs text-gray-400 ml-1">More</span>
        </div>
      </div>

      {/* Habit Rankings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Habit Performance</h3>
        <div className="space-y-3">
          {habitRankings.map(({ habit, stats, streak }, index) => {
            const cat = CATEGORY_CONFIG[habit.category];
            return (
              <div key={habit.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-6 text-center">
                  {index + 1}
                </span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <HabitIcon name={habit.icon} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{habit.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{stats.completionRate}% rate</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{stats.totalCompletions} total</span>
                  </div>
                </div>
                <StreakBadge streak={streak} compact />
                {/* Progress bar */}
                <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.completionRate}%`,
                      backgroundColor: stats.completionRate >= 80 ? '#10B981' : stats.completionRate >= 50 ? '#6366F1' : '#F59E0B',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
