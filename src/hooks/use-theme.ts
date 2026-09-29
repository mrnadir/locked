import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const systemScheme = useColorScheme();
  const { settings } = useSettings();
  const preference = settings.themePreference;
  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  return { colors: isDark ? Colors.dark : Colors.light, isDark };
}
