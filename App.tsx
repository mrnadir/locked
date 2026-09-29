import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BlockerProvider } from '@/context/blocker-context';
import { SettingsProvider } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import { navigationRef } from '@/navigation/navigation-ref';
import { RootNavigator } from '@/navigation/root-navigator';

SplashScreen.preventAutoHideAsync();

function ThemedNavigation() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const theme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <BlockerProvider>
          <ThemedNavigation />
        </BlockerProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
