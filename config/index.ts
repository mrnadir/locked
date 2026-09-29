import Constants from 'expo-constants';

export const AppConfig = {
  name: 'Locked',
  tagline: 'Take back your time',
  version: Constants.expoConfig?.version ?? '1.0.0',
  supportEmail: 'support@locked.app',
  privacyPolicyUrl: 'https://locked.app/privacy',
  termsUrl: 'https://locked.app/terms',

  /**
   * Uses the in-JS mock blocker + screen time data. Set to false once the
   * native module (UsageStats / Accessibility on Android, FamilyControls on iOS)
   * is implemented in `src/utils/app-blocker.ts`.
   */
  useMockNativeModule: true,

  splashMinDurationMs: 1800,

  limits: {
    maxBlockedApps: 15,
    maxSchedules: 10,
  },

  focusDurationsMinutes: [15, 30, 60, 120, 240],
  unlockDurationsMinutes: [5, 15, 30],

  defaults: {
    unlockWaitSeconds: 15,
    maxUnlocksPerDay: 3,
    blockMessage: 'Stay focused. You can do this!',
  },
} as const;
