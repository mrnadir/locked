import { AppConfig } from '@config';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import type {
  ActiveBlock,
  BlockStatus,
  DailyUsage,
  FocusSession,
  InstalledApp,
  PermissionKind,
  PermissionStatus,
  Schedule,
  TemporaryUnlock,
} from '@/constants/types';
import { getAppBlocker } from '@/utils/app-blocker';
import {
  getActiveBlocks,
  isScheduleFinished,
  isTemporarilyUnlocked,
  summarizeBlocks,
} from '@/utils/block-status';
import { toDateKey } from '@/utils/format';
import { loadJSON, saveJSON, StorageKeys } from '@/utils/storage';

const blocker = getAppBlocker();
const TICK_MS = 5_000;

const DefaultSchedules: Schedule[] = [
  { id: 'work', name: 'Work hours', startMinutes: 9 * 60, endMinutes: 17 * 60, days: [1, 2, 3, 4, 5], enabled: false },
  { id: 'bedtime', name: 'Bedtime', startMinutes: 23 * 60, endMinutes: 7 * 60, days: [0, 1, 2, 3, 4, 5, 6], enabled: false },
];

interface PersistedBlockerState {
  blockedAppIds: string[];
  schedules: Schedule[];
  alwaysOn: boolean;
  focusSession: FocusSession | null;
  unlocks: TemporaryUnlock[];
  unlockLog: { date: string; count: number };
}

const DefaultBlockerState: PersistedBlockerState = {
  blockedAppIds: [],
  schedules: DefaultSchedules,
  alwaysOn: false,
  focusSession: null,
  unlocks: [],
  unlockLog: { date: '', count: 0 },
};

interface BlockerContextValue extends PersistedBlockerState {
  hydrated: boolean;
  now: number;
  blockStatus: BlockStatus;

  installedApps: InstalledApp[];
  appsLoading: boolean;
  loadInstalledApps: () => Promise<void>;
  getApp: (appId: string) => InstalledApp | undefined;

  permissions: PermissionStatus;
  requestPermission: (kind: PermissionKind) => Promise<boolean>;

  usage: DailyUsage[];
  usageLoading: boolean;
  refreshUsage: () => Promise<void>;

  setBlockedApps: (appIds: string[]) => void;
  toggleBlockedApp: (appId: string) => boolean;
  isAppBlockedNow: (appId: string) => boolean;
  /** Apps being intercepted right now (after temporary unlocks). */
  activeBlockedAppIds: string[];
  /** The block currently responsible for locking `appId`, if any. */
  getAppBlock: (appId: string) => ActiveBlock | undefined;

  setAlwaysOn: (value: boolean) => void;
  startFocus: (minutes: number) => void;
  stopFocus: () => void;

  saveSchedule: (schedule: Schedule) => void;
  deleteSchedule: (scheduleId: string) => void;
  toggleSchedule: (scheduleId: string) => void;
  getScheduleApps: (schedule: Schedule) => InstalledApp[];

  unlocksUsedToday: number;
  unlockApp: (appId: string, minutes: number) => void;
  resetBlocker: () => void;
}

const BlockerContext = createContext<BlockerContextValue | null>(null);

export function BlockerProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PersistedBlockerState>(DefaultBlockerState);
  const [now, setNow] = useState(() => Date.now());

  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionStatus>({
    usageAccess: false,
    overlay: false,
    accessibility: false,
  });
  const [usage, setUsage] = useState<DailyUsage[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [saved, perms, apps] = await Promise.all([
          loadJSON<Partial<PersistedBlockerState>>(StorageKeys.blocker),
          blocker.getPermissions(),
          blocker.getInstalledApps(),
        ]);
        if (saved) {
          const loadedAt = new Date();
          const schedules = (saved.schedules ?? DefaultSchedules).filter(
            (s) => !isScheduleFinished(s, loadedAt)
          );
          setState({ ...DefaultBlockerState, ...saved, schedules });
        }
        setPermissions(perms);
        setInstalledApps(apps);
      } catch (error) {
        console.warn('Failed to load blocker state', error);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(StorageKeys.blocker, state);
  }, [hydrated, state]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const activeBlocks = getActiveBlocks({
    now: new Date(now),
    alwaysOn: state.alwaysOn,
    focusSession: state.focusSession,
    schedules: state.schedules,
    blockedAppIds: state.blockedAppIds,
  });
  const blockStatus = summarizeBlocks(activeBlocks);

  const activeBlockList = [...new Set(activeBlocks.flatMap((b) => b.appIds))].filter(
    (id) => !isTemporarilyUnlocked(id, state.unlocks, now)
  );
  const activeBlockKey = activeBlockList.join('|');

  useEffect(() => {
    blocker.syncBlockList(activeBlockKey ? activeBlockKey.split('|') : []);
  }, [activeBlockKey]);

  const todayKey = toDateKey(new Date(now));
  const unlocksUsedToday = state.unlockLog.date === todayKey ? state.unlockLog.count : 0;

  const loadInstalledApps = async () => {
    setAppsLoading(true);
    try {
      setInstalledApps(await blocker.getInstalledApps());
    } finally {
      setAppsLoading(false);
    }
  };

  const refreshUsage = async () => {
    setUsageLoading(true);
    try {
      setUsage(await blocker.getUsage(7));
    } finally {
      setUsageLoading(false);
    }
  };

  const value: BlockerContextValue = {
    ...state,
    hydrated,
    now,
    blockStatus,

    installedApps,
    appsLoading,
    loadInstalledApps,
    getApp: (appId) => installedApps.find((a) => a.id === appId),

    permissions,
    requestPermission: async (kind) => {
      const granted = await blocker.requestPermission(kind);
      setPermissions(await blocker.getPermissions());
      return granted;
    },

    usage,
    usageLoading,
    refreshUsage,

    setBlockedApps: (appIds) =>
      setState((prev) => ({ ...prev, blockedAppIds: appIds.slice(0, AppConfig.limits.maxBlockedApps) })),
    toggleBlockedApp: (appId) => {
      const isBlocked = state.blockedAppIds.includes(appId);
      if (!isBlocked && state.blockedAppIds.length >= AppConfig.limits.maxBlockedApps) return false;
      setState((prev) => ({
        ...prev,
        blockedAppIds: isBlocked
          ? prev.blockedAppIds.filter((id) => id !== appId)
          : [...prev.blockedAppIds, appId],
      }));
      return true;
    },
    isAppBlockedNow: (appId) => activeBlockList.includes(appId),
    activeBlockedAppIds: activeBlockList,
    getAppBlock: (appId) => activeBlocks.find((b) => b.appIds.includes(appId)),

    setAlwaysOn: (value) => setState((prev) => ({ ...prev, alwaysOn: value })),
    startFocus: (minutes) => {
      const startedAt = Date.now();
      setNow(startedAt);
      setState((prev) => ({
        ...prev,
        focusSession: { startedAt, endsAt: startedAt + minutes * 60_000 },
      }));
    },
    stopFocus: () => setState((prev) => ({ ...prev, focusSession: null })),

    saveSchedule: (schedule) =>
      setState((prev) => {
        const exists = prev.schedules.some((s) => s.id === schedule.id);
        return {
          ...prev,
          schedules: exists
            ? prev.schedules.map((s) => (s.id === schedule.id ? schedule : s))
            : [...prev.schedules, schedule],
        };
      }),
    deleteSchedule: (scheduleId) =>
      setState((prev) => ({ ...prev, schedules: prev.schedules.filter((s) => s.id !== scheduleId) })),
    toggleSchedule: (scheduleId) =>
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((s) => (s.id === scheduleId ? { ...s, enabled: !s.enabled } : s)),
      })),
    getScheduleApps: (schedule) =>
      (schedule.appIds?.length ? schedule.appIds : state.blockedAppIds)
        .map((id) => installedApps.find((a) => a.id === id))
        .filter((a) => a !== undefined),

    unlocksUsedToday,
    unlockApp: (appId, minutes) => {
      const current = Date.now();
      setNow(current);
      setState((prev) => ({
        ...prev,
        unlocks: [
          ...prev.unlocks.filter((u) => u.appId !== appId && u.until > current),
          { appId, until: current + minutes * 60_000 },
        ],
        unlockLog: {
          date: todayKey,
          count: (prev.unlockLog.date === todayKey ? prev.unlockLog.count : 0) + 1,
        },
      }));
    },
    resetBlocker: () => setState(DefaultBlockerState),
  };

  return <BlockerContext.Provider value={value}>{children}</BlockerContext.Provider>;
}

export function useBlocker() {
  const ctx = useContext(BlockerContext);
  if (!ctx) throw new Error('useBlocker must be used inside <BlockerProvider>');
  return ctx;
}
