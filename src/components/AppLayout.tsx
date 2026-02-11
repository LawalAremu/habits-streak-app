import React, { useState, useCallback } from 'react';
import { LayoutDashboard, ListChecks, BarChart3, Settings, Plus } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useCloudSync } from '@/hooks/useCloudSync';
import { Habit, HabitCompletion } from '@/types/habit';
import Dashboard from './tracker/Dashboard';
import AllHabitsScreen from './tracker/AllHabitsScreen';
import StatsScreen from './tracker/StatsScreen';
import SettingsScreen from './tracker/SettingsScreen';
import AddEditHabitModal from './tracker/AddEditHabitModal';

type Screen = 'dashboard' | 'habits' | 'stats' | 'settings';

const AppLayout: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const {
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
    getHabitStats,
    getWeekData,
    getMonthData,
    exportData,
    importData,
    clearAllData,
    setHabitsData,
    setCompletionsData,
  } = useHabits();

  const {
    syncCode,
    lastSyncedAt,
    syncStatus,
    syncError,
    enableSync,
    backupToCloud,
    restoreFromCloud,
    disconnectSync,
    isConnected,
  } = useCloudSync();

  const handleSaveHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }
    setEditingHabit(null);
  }, [editingHabit, updateHabit, addHabit]);

  const handleEditHabit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setShowAddModal(true);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingHabit(null);
    setShowAddModal(true);
  }, []);

  const handleDataRestored = useCallback((restoredHabits: Habit[], restoredCompletions: HabitCompletion[]) => {
    setHabitsData(restoredHabits);
    setCompletionsData(restoredCompletions);
  }, [setHabitsData, setCompletionsData]);

  const navItems = [
    { id: 'dashboard' as Screen, icon: LayoutDashboard, label: 'Today' },
    { id: 'habits' as Screen, icon: ListChecks, label: 'Habits' },
    { id: 'stats' as Screen, icon: BarChart3, label: 'Stats' },
    { id: 'settings' as Screen, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Daily Discipline</h1>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentScreen === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Daily Discipline</h1>
          </div>
          <button
            onClick={handleOpenAdd}
            className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
        {currentScreen === 'dashboard' && (
          <Dashboard
            todayHabits={todayHabits}
            todayProgress={todayProgress}
            todayCompletedCount={todayCompletedCount}
            isCompleted={isCompleted}
            getStreak={getStreak}
            toggleCompletion={toggleCompletion}
            onAddHabit={handleOpenAdd}
            onEditHabit={handleEditHabit}
            onArchiveHabit={archiveHabit}
            onDeleteHabit={deleteHabit}
            onNavigateToStats={() => setCurrentScreen('stats')}
          />
        )}
        {currentScreen === 'habits' && (
          <AllHabitsScreen
            activeHabits={activeHabits}
            archivedHabits={archivedHabits}
            getStreak={getStreak}
            getHabitStats={getHabitStats}
            onAddHabit={handleOpenAdd}
            onEditHabit={handleEditHabit}
            onArchiveHabit={archiveHabit}
            onDeleteHabit={deleteHabit}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}
        {currentScreen === 'stats' && (
          <StatsScreen
            activeHabits={activeHabits}
            getHabitStats={getHabitStats}
            getWeekData={getWeekData}
            getMonthData={getMonthData}
            isCompleted={isCompleted}
            getStreak={getStreak}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            onBack={() => setCurrentScreen('dashboard')}
            onExport={exportData}
            onImport={importData}
            onClearAll={clearAllData}
            habitCount={activeHabits.length + archivedHabits.length}
            completionCount={completions.length}
            habits={habits}
            completions={completions}
            syncCode={syncCode}
            lastSyncedAt={lastSyncedAt}
            syncStatus={syncStatus}
            syncError={syncError}
            isConnected={isConnected}
            onEnableSync={enableSync}
            onBackup={backupToCloud}
            onRestore={restoreFromCloud}
            onDisconnect={disconnectSync}
            onDataRestored={handleDataRestored}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add/Edit Modal */}
      <AddEditHabitModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingHabit(null); }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
      />
    </div>
  );
};

export default AppLayout;
