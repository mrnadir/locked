import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type AppCategory =
  | 'social'
  | 'entertainment'
  | 'games'
  | 'communication'
  | 'shopping'
  | 'productivity'
  | 'utilities';

export interface InstalledApp {
  /** Android package name / iOS bundle id. */
  id: string;
  name: string;
  category: AppCategory;
  icon: IconName;
  color: string;
}

export interface Schedule {
  id: string;
  name: string;
  /** Minutes from midnight. If end < start the schedule runs overnight. */
  startMinutes: number;
  endMinutes: number;
  /** 0 = Sunday … 6 = Saturday. Ignored when `date` is set. */
  days: number[];
  enabled: boolean;
  /** Apps this schedule blocks. Missing or empty means the main block list. */
  appIds?: string[];
  /** YYYY-MM-DD for a one-time block. */
  date?: string;
}

export interface FocusSession {
  startedAt: number;
  endsAt: number;
}

export type BlockReason = 'focus' | 'schedule' | 'always';

export interface BlockStatus {
  active: boolean;
  reason: BlockReason | null;
  /** Epoch ms when blocking ends, null when it has no fixed end. */
  until: number | null;
  label: string;
}

export interface ActiveBlock extends BlockStatus {
  appIds: string[];
}

export type UnlockMethod = 'timer' | 'pin' | 'none';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface BlockScreenStyle {
  message: string;
  accentColor: string;
  showQuote: boolean;
  showCountdown: boolean;
}

export interface Settings {
  userName: string;
  themePreference: ThemePreference;
  notificationsEnabled: boolean;
  strictMode: boolean;
  unlockMethod: UnlockMethod;
  unlockWaitSeconds: number;
  maxUnlocksPerDay: number;
  pin: string | null;
  blockScreen: BlockScreenStyle;
}

export type PermissionKind = 'usageAccess' | 'overlay' | 'accessibility';
export type PermissionStatus = Record<PermissionKind, boolean>;

export interface AppUsage {
  appId: string;
  minutes: number;
  opens: number;
}

export interface DailyUsage {
  /** YYYY-MM-DD */
  date: string;
  totalMinutes: number;
  apps: AppUsage[];
}

export interface TemporaryUnlock {
  appId: string;
  until: number;
}
