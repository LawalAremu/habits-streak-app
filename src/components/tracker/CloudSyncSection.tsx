import React, { useState } from 'react';
import {
  Cloud, CloudOff, RefreshCw, Copy, Check, Link2, Unlink,
  ArrowUpFromLine, ArrowDownToLine, Loader2, AlertCircle,
  CheckCircle2, Smartphone, KeyRound, ShieldCheck
} from 'lucide-react';
import { Habit, HabitCompletion } from '@/types/habit';
import { SyncStatus } from '@/hooks/useCloudSync';

interface CloudSyncSectionProps {
  syncCode: string | null;
  lastSyncedAt: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  isConnected: boolean;
  habits: Habit[];
  completions: HabitCompletion[];
  onEnableSync: (habits: Habit[], completions: HabitCompletion[]) => Promise<string | null>;
  onBackup: (habits: Habit[], completions: HabitCompletion[]) => Promise<boolean>;
  onRestore: (code: string) => Promise<{ habits: Habit[]; completions: HabitCompletion[] } | null>;
  onDisconnect: () => void;
  onDataRestored: (habits: Habit[], completions: HabitCompletion[]) => void;
}

const CloudSyncSection: React.FC<CloudSyncSectionProps> = ({
  syncCode,
  lastSyncedAt,
  syncStatus,
  syncError,
  isConnected,
  habits,
  completions,
  onEnableSync,
  onBackup,
  onRestore,
  onDisconnect,
  onDataRestored,
}) => {
  const [showRestoreInput, setShowRestoreInput] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);

  const handleCopyCode = async () => {
    if (!syncCode) return;
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = syncCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnableSync = async () => {
    await onEnableSync(habits, completions);
  };

  const handleBackup = async () => {
    await onBackup(habits, completions);
  };

  const handleRestore = async () => {
    if (!restoreCode.trim()) return;
    
    if (!restoreConfirm) {
      setRestoreConfirm(true);
      setTimeout(() => setRestoreConfirm(false), 5000);
      return;
    }

    const data = await onRestore(restoreCode.trim());
    if (data) {
      onDataRestored(data.habits, data.completions);
      setShowRestoreInput(false);
      setRestoreCode('');
      setRestoreConfirm(false);
    }
  };

  const handleDisconnect = () => {
    if (!showDisconnectConfirm) {
      setShowDisconnectConfirm(true);
      setTimeout(() => setShowDisconnectConfirm(false), 5000);
      return;
    }
    onDisconnect();
    setShowDisconnectConfirm(false);
  };

  const formatSyncCode = (code: string) => {
    return code.replace(/(.{4})/g, '$1 ').trim().replace(/ -/g, ' - ');
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const isLoading = syncStatus === 'syncing';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Cloud Sync
          </h3>
          {isConnected && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {/* Status / Error Messages */}
        {syncError && (
          <div className="px-5 py-3 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{syncError}</p>
            </div>
          </div>
        )}

        {syncStatus === 'success' && !syncError && (
          <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Sync completed successfully!</p>
            </div>
          </div>
        )}

        {!isConnected ? (
          <>
            {/* Not connected - Show enable sync and restore options */}
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                  <Cloud className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Sync Across Devices</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    Generate a unique sync code to backup your habits to the cloud. Use the same code on another device to restore your data. No account needed.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleEnableSync}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  {isLoading ? 'Generating...' : 'Enable Cloud Sync'}
                </button>

                <button
                  onClick={() => setShowRestoreInput(!showRestoreInput)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  I Have a Sync Code
                </button>
              </div>
            </div>

            {/* Restore Input */}
            {showRestoreInput && (
              <div className="p-5 bg-gray-50 dark:bg-gray-800/50">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Enter Your Sync Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={restoreCode}
                    onChange={(e) => {
                      setRestoreCode(e.target.value.toUpperCase());
                      setRestoreConfirm(false);
                    }}
                    placeholder="XXXX-XXXX-XXXX"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 font-mono text-center text-lg tracking-wider focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase"
                    maxLength={14}
                  />
                </div>
                <button
                  onClick={handleRestore}
                  disabled={isLoading || restoreCode.trim().length < 10}
                  className={`flex items-center justify-center gap-2 w-full mt-3 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    restoreConfirm
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="w-4 h-4" />
                  )}
                  {isLoading ? 'Restoring...' : restoreConfirm ? 'This will replace local data. Tap to confirm' : 'Restore from Cloud'}
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                  Restoring will replace all local habits and completions
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Connected - Show sync code and actions */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Your Sync Code</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold font-mono text-gray-900 dark:text-white tracking-wider">
                      {syncCode ? formatSyncCode(syncCode) : ''}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      title="Copy sync code"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sync info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
                {lastSyncedAt && (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Last synced: {formatDate(lastSyncedAt)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  {habits.length} habits, {completions.length} completions
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBackup}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUpFromLine className="w-4 h-4" />
                  )}
                  Backup Now
                </button>
                <button
                  onClick={() => {
                    if (syncCode) {
                      setRestoreCode(syncCode);
                      setShowRestoreInput(true);
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Restore
                </button>
              </div>
            </div>

            {/* Restore from different code */}
            {showRestoreInput && (
              <div className="p-5 bg-gray-50 dark:bg-gray-800/50">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Restore from Sync Code
                </label>
                <input
                  type="text"
                  value={restoreCode}
                  onChange={(e) => {
                    setRestoreCode(e.target.value.toUpperCase());
                    setRestoreConfirm(false);
                  }}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 font-mono text-center text-lg tracking-wider focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase mb-2"
                  maxLength={14}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowRestoreInput(false); setRestoreConfirm(false); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestore}
                    disabled={isLoading || restoreCode.trim().length < 10}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      restoreConfirm
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : null}
                    {restoreConfirm ? 'Confirm Replace' : 'Restore'}
                  </button>
                </div>
              </div>
            )}

            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              className="flex items-center justify-between w-full px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {showDisconnectConfirm ? (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                ) : (
                  <Unlink className="w-5 h-5 text-gray-400" />
                )}
                <div className="text-left">
                  <p className={`text-sm font-semibold ${showDisconnectConfirm ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {showDisconnectConfirm ? 'Tap again to disconnect' : 'Disconnect Sync'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {showDisconnectConfirm ? 'Cloud data will be preserved. You can reconnect later.' : 'Remove sync code from this device'}
                  </p>
                </div>
              </div>
            </button>
          </>
        )}

        {/* Privacy note */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/30">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
            <CloudOff className="w-3 h-3 inline mr-1 relative -top-px" />
            Your sync code is anonymous — no email, no account. Only someone with your exact code can access your data. Keep it safe!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CloudSyncSection;
