import { AppConfig } from '@config';

import { MockInstalledApps } from '@/constants/apps';
import type {
  AppCategory,
  DailyUsage,
  InstalledApp,
  PermissionKind,
  PermissionStatus,
} from '@/constants/types';
import { toDateKey } from '@/utils/format';
import { loadJSON, saveJSON, StorageKeys } from '@/utils/storage';

/**
 * Contract for the native app-blocking module.
 *
 * Android: UsageStatsManager (screen time + foreground app detection),
 * SYSTEM_ALERT_WINDOW (block overlay) and an AccessibilityService.
 * iOS: FamilyControls / ManagedSettings / DeviceActivity (needs Apple entitlement).
 *
 * Implement it as an Expo Module and swap it in `getAppBlocker()` below.
 */
export interface AppBlockerModule {
  getPermissions(): Promise<PermissionStatus>;
  requestPermission(kind: PermissionKind): Promise<boolean>;
  getInstalledApps(): Promise<InstalledApp[]>;
  /** Usage for the last `days` days, oldest first, today last. */
  getUsage(days: number): Promise<DailyUsage[]>;
  /** The set of apps that must be intercepted right now. */
  syncBlockList(appIds: string[]): Promise<void>;
  /** Fired when the user opens an app that is in the synced block list. */
  addBlockedAppOpenedListener(listener: (appId: string) => void): () => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const CategoryWeight: Record<AppCategory, number> = {
  social: 70,
  entertainment: 60,
  games: 40,
  communication: 35,
  shopping: 12,
  productivity: 15,
  utilities: 6,
};

class MockAppBlocker implements AppBlockerModule {
  private permissions: PermissionStatus = {
    usageAccess: false,
    overlay: false,
    accessibility: false,
  };
  private permissionsLoaded = false;
  private blockList = new Set<string>();
  private listeners = new Set<(appId: string) => void>();

  private async ensurePermissionsLoaded() {
    if (this.permissionsLoaded) return;
    const saved = await loadJSON<PermissionStatus>(StorageKeys.permissions);
    if (saved) this.permissions = saved;
    this.permissionsLoaded = true;
  }

  async getPermissions() {
    await this.ensurePermissionsLoaded();
    return { ...this.permissions };
  }

  async requestPermission(kind: PermissionKind) {
    await this.ensurePermissionsLoaded();
    await wait(600);
    this.permissions = { ...this.permissions, [kind]: true };
    await saveJSON(StorageKeys.permissions, this.permissions);
    return true;
  }

  async getInstalledApps() {
    await wait(1200);
    return [...MockInstalledApps].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getUsage(days: number) {
    await wait(300);
    const now = new Date();
    const dayFraction = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
    const result: DailyUsage[] = [];

    for (let offset = days - 1; offset >= 0; offset--) {
      const date = new Date(now);
      date.setDate(now.getDate() - offset);
      const key = toDateKey(date);
      const scale = offset === 0 ? Math.max(dayFraction, 0.05) : 1;

      const apps = MockInstalledApps.map((app) => {
        const rand = seededRandom(`${app.id}:${key}`);
        const used = rand() > 0.25;
        const minutes = used ? Math.round(CategoryWeight[app.category] * (0.2 + rand() * 1.3) * scale) : 0;
        const opens = minutes > 0 ? Math.max(1, Math.round(minutes / (2 + rand() * 6))) : 0;
        return { appId: app.id, minutes, opens };
      }).filter((a) => a.minutes > 0);

      apps.sort((a, b) => b.minutes - a.minutes);
      result.push({
        date: key,
        totalMinutes: apps.reduce((sum, a) => sum + a.minutes, 0),
        apps,
      });
    }
    return result;
  }

  async syncBlockList(appIds: string[]) {
    this.blockList = new Set(appIds);
  }

  addBlockedAppOpenedListener(listener: (appId: string) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Mock-only: pretend the user launched `appId`. Returns true if it was intercepted. */
  simulateAppOpen(appId: string): boolean {
    if (!this.blockList.has(appId)) return false;
    this.listeners.forEach((listener) => listener(appId));
    return true;
  }
}

const mockBlocker = new MockAppBlocker();

export function getAppBlocker(): AppBlockerModule {
  if (AppConfig.useMockNativeModule) return mockBlocker;
  throw new Error('Native app blocker module is not implemented yet.');
}

/** Simulates launching another app. Only available while using the mock module. */
export function simulateAppOpen(appId: string): boolean {
  return mockBlocker.simulateAppOpen(appId);
}
