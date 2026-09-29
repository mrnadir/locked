import { AppConfig } from '@config';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { Palette } from '@/constants/theme';
import type { BlockScreenStyle, Settings } from '@/constants/types';
import { loadJSON, saveJSON, StorageKeys } from '@/utils/storage';

export const DefaultSettings: Settings = {
  userName: '',
  themePreference: 'system',
  notificationsEnabled: true,
  strictMode: false,
  unlockMethod: 'timer',
  unlockWaitSeconds: AppConfig.defaults.unlockWaitSeconds,
  maxUnlocksPerDay: AppConfig.defaults.maxUnlocksPerDay,
  pin: null,
  blockScreen: {
    message: AppConfig.defaults.blockMessage,
    accentColor: Palette.primary,
    showQuote: true,
    showCountdown: true,
  },
};

interface SettingsContextValue {
  hydrated: boolean;
  onboardingDone: boolean;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  updateBlockScreen: (patch: Partial<BlockScreenStyle>) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [settings, setSettings] = useState<Settings>(DefaultSettings);

  useEffect(() => {
    (async () => {
      try {
        const [savedSettings, savedOnboarding] = await Promise.all([
          loadJSON<Partial<Settings>>(StorageKeys.settings),
          loadJSON<boolean>(StorageKeys.onboardingDone),
        ]);
        if (savedSettings) {
          setSettings({
            ...DefaultSettings,
            ...savedSettings,
            blockScreen: { ...DefaultSettings.blockScreen, ...savedSettings.blockScreen },
          });
        }
        setOnboardingDone(savedOnboarding === true);
      } catch (error) {
        console.warn('Failed to load settings', error);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(StorageKeys.settings, settings);
  }, [hydrated, settings]);

  const value: SettingsContextValue = {
    hydrated,
    onboardingDone,
    settings,
    updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
    updateBlockScreen: (patch) =>
      setSettings((prev) => ({ ...prev, blockScreen: { ...prev.blockScreen, ...patch } })),
    completeOnboarding: () => {
      setOnboardingDone(true);
      saveJSON(StorageKeys.onboardingDone, true);
    },
    resetSettings: () => {
      setSettings(DefaultSettings);
      setOnboardingDone(false);
      saveJSON(StorageKeys.onboardingDone, false);
    },
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
