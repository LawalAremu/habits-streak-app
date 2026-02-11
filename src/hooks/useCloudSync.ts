import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Habit, HabitCompletion } from '@/types/habit';

const SYNC_CODE_KEY = 'discipline_tracker_sync_code';
const LAST_SYNC_KEY = 'discipline_tracker_last_sync';

function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join('-');
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export function useCloudSync() {
  const [syncCode, setSyncCode] = useState<string | null>(() => {
    return localStorage.getItem(SYNC_CODE_KEY);
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem(LAST_SYNC_KEY);
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Persist sync code
  useEffect(() => {
    if (syncCode) {
      localStorage.setItem(SYNC_CODE_KEY, syncCode);
    } else {
      localStorage.removeItem(SYNC_CODE_KEY);
    }
  }, [syncCode]);

  useEffect(() => {
    if (lastSyncedAt) {
      localStorage.setItem(LAST_SYNC_KEY, lastSyncedAt);
    } else {
      localStorage.removeItem(LAST_SYNC_KEY);
    }
  }, [lastSyncedAt]);

  // Generate a new sync code and do initial backup
  const enableSync = useCallback(async (habits: Habit[], completions: HabitCompletion[]) => {
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      let code = generateSyncCode();
      let attempts = 0;

      // Ensure uniqueness
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from('sync_data')
          .select('id')
          .eq('sync_code', code)
          .maybeSingle();

        if (!existing) break;
        code = generateSyncCode();
        attempts++;
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from('sync_data')
        .insert({
          sync_code: code,
          habits: habits,
          completions: completions,
          device_name: getDeviceName(),
          last_synced_at: now,
        });

      if (error) throw new Error(error.message);

      setSyncCode(code);
      setLastSyncedAt(now);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return code;
    } catch (err: any) {
      setSyncError(err.message || 'Failed to enable sync');
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
      return null;
    }
  }, []);

  // Backup local data to cloud
  const backupToCloud = useCallback(async (habits: Habit[], completions: HabitCompletion[]) => {
    if (!syncCode) {
      setSyncError('No sync code. Please enable sync first.');
      setSyncStatus('error');
      return false;
    }

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const now = new Date().toISOString();
      const { error, data } = await supabase
        .from('sync_data')
        .update({
          habits: habits,
          completions: completions,
          device_name: getDeviceName(),
          last_synced_at: now,
        })
        .eq('sync_code', syncCode)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Sync code not found in cloud. It may have been deleted.');

      setLastSyncedAt(now);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return true;
    } catch (err: any) {
      setSyncError(err.message || 'Backup failed');
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
      return false;
    }
  }, [syncCode]);

  // Restore data from cloud using a sync code
  const restoreFromCloud = useCallback(async (code: string): Promise<{ habits: Habit[]; completions: HabitCompletion[] } | null> => {
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const normalizedCode = code.toUpperCase().trim();
      const { data, error } = await supabase
        .from('sync_data')
        .select('*')
        .eq('sync_code', normalizedCode)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Sync code not found. Please double-check your code.');

      setSyncCode(normalizedCode);
      setLastSyncedAt(data.last_synced_at);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);

      return {
        habits: (data.habits as Habit[]) || [],
        completions: (data.completions as HabitCompletion[]) || [],
      };
    } catch (err: any) {
      setSyncError(err.message || 'Restore failed');
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
      return null;
    }
  }, []);

  // Check if a sync code exists
  const checkSyncCode = useCallback(async (code: string) => {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const { data } = await supabase
        .from('sync_data')
        .select('sync_code, last_synced_at, device_name, created_at')
        .eq('sync_code', normalizedCode)
        .maybeSingle();

      return data ? {
        exists: true,
        lastSyncedAt: data.last_synced_at,
        deviceName: data.device_name,
        createdAt: data.created_at,
      } : { exists: false };
    } catch {
      return { exists: false };
    }
  }, []);

  // Disconnect sync (remove local sync code, keep cloud data)
  const disconnectSync = useCallback(() => {
    setSyncCode(null);
    setLastSyncedAt(null);
    localStorage.removeItem(SYNC_CODE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    setSyncStatus('idle');
    setSyncError(null);
  }, []);

  return {
    syncCode,
    lastSyncedAt,
    syncStatus,
    syncError,
    enableSync,
    backupToCloud,
    restoreFromCloud,
    checkSyncCode,
    disconnectSync,
    isConnected: !!syncCode,
  };
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS Device';
  if (/Android/.test(ua)) return 'Android Device';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Web Browser';
}
