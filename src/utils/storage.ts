import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  onboardingDone: 'locked:onboardingDone',
  settings: 'locked:settings',
  blocker: 'locked:blocker',
  permissions: 'locked:permissions',
} as const;

export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn(`Failed to load "${key}"`, error);
    return null;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save "${key}"`, error);
  }
}
