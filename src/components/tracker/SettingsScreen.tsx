import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Sun, Moon, Monitor, Download, Upload, Trash2,
  Bell, BellOff, Shield, Info, ChevronRight, AlertTriangle,
  FileJson, CheckCircle2
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Habit, HabitCompletion } from '@/types/habit';
import CloudSyncSection from './CloudSyncSection';
import { SyncStatus } from '@/hooks/useCloudSync';

interface SettingsScreenProps {
  onBack: () => void;
  onExport: () => void;
  onImport: (jsonString: string) => boolean;
  onClearAll: () => void;
  habitCount: number;
  completionCount: number;
  habits: Habit[];
  completions: HabitCompletion[];
  syncCode: string | null;
  lastSyncedAt: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  isConnected: boolean;
  onEnableSync: (habits: Habit[], completions: HabitCompletion[]) => Promise<string | null>;
  onBackup: (habits: Habit[], completions: HabitCompletion[]) => Promise<boolean>;
  onRestore: (code: string) => Promise<{ habits: Habit[]; completions: HabitCompletion[] } | null>;
  onDisconnect: () => void;
  onDataRestored: (habits: Habit[], completions: HabitCompletion[]) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onExport,
  onImport,
  onClearAll,
  habitCount,
  completionCount,
  habits,
  completions,
  syncCode,
  lastSyncedAt,
  syncStatus,
  syncError,
  isConnected,
  onEnableSync,
  onBackup,
  onRestore,
  onDisconnect,
  onDataRestored,
}) => {
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('discipline_notifications') === 'true';
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNotificationToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('discipline_notifications', String(newValue));
    if (newValue && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const success = onImport(result);
      setImportStatus(success ? 'success' : 'error');
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    if (showClearConfirm) {
      onClearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 5000);
    }
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Cloud Sync */}
      <CloudSyncSection
        syncCode={syncCode}
        lastSyncedAt={lastSyncedAt}
        syncStatus={syncStatus}
        syncError={syncError}
        isConnected={isConnected}
        habits={habits}
        completions={completions}
        onEnableSync={onEnableSync}
        onBackup={onBackup}
        onRestore={onRestore}
        onDisconnect={onDisconnect}
        onDataRestored={onDataRestored}
      />

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Choose your preferred theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === opt.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${theme === opt.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className={`text-sm font-medium ${theme === opt.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notifications</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-indigo-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get reminded to complete your habits</p>
              </div>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Management</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Local Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {habitCount} habits, {completionCount} completions stored locally
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onExport}
            className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-indigo-500" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Export Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Download your data as JSON</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Import Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {importStatus === 'success' ? 'Data imported successfully!' : importStatus === 'error' ? 'Import failed. Check file format.' : 'Restore from a backup file'}
                </p>
              </div>
            </div>
            {importStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={handleClearAll}
            className="flex items-center justify-between w-full px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              {showClearConfirm ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Trash2 className="w-5 h-5 text-red-500" />}
              <div className="text-left">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {showClearConfirm ? 'Tap again to confirm' : 'Clear All Data'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {showClearConfirm ? 'This action cannot be undone!' : 'Delete all habits and completions'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Privacy & About */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">About</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Privacy First</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">All data is stored locally. Cloud sync is optional and anonymous — no accounts, no tracking.</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Daily Discipline Tracker</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Version 1.1.0 — Build better habits, one day at a time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
};

export default SettingsScreen;
