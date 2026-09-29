import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useBlockedAppListener } from '@/hooks/use-blocked-app-listener';
import { useTheme } from '@/hooks/use-theme';
import { MainTabs } from '@/navigation/main-tabs';
import type { RootStackParamList } from '@/navigation/types';
import { AboutScreen } from '@/screens/about-screen';
import { AppSelectionScreen } from '@/screens/app-selection-screen';
import { AppUsageDetailScreen } from '@/screens/app-usage-detail-screen';
import { BlockOverlayScreen } from '@/screens/block-overlay-screen';
import { BlockScreenCustomizeScreen } from '@/screens/block-screen-customize-screen';
import { OnboardingScreen } from '@/screens/onboarding-screen';
import { PermissionsScreen } from '@/screens/permissions-screen';
import { PinSetupScreen } from '@/screens/pin-setup-screen';
import { ScheduleEditorScreen } from '@/screens/schedule-editor-screen';
import { SplashScreen } from '@/screens/splash-screen';
import { UnlockSettingsScreen } from '@/screens/unlock-settings-screen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  useBlockedAppListener();

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Group screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Group>

      <Stack.Screen
        name="Permissions"
        component={PermissionsScreen}
        options={({ route }) => ({
          headerShown: !!route.params?.fromSettings,
          title: 'Permissions',
        })}
      />
      <Stack.Screen
        name="AppSelection"
        component={AppSelectionScreen}
        options={({ route }) => ({
          headerShown: !route.params?.fromOnboarding,
          title: 'Choose apps',
        })}
      />

      <Stack.Group screenOptions={{ headerShown: true }}>
        <Stack.Screen name="AppUsageDetail" component={AppUsageDetailScreen} />
        <Stack.Screen name="ScheduleEditor" component={ScheduleEditorScreen} options={{ title: 'Schedule' }} />
        <Stack.Screen name="BlockScreenCustomize" component={BlockScreenCustomizeScreen} options={{ title: 'Block screen' }} />
        <Stack.Screen name="UnlockSettings" component={UnlockSettingsScreen} options={{ title: 'Unlock rules' }} />
        <Stack.Screen name="PinSetup" component={PinSetupScreen} options={{ title: 'PIN', presentation: 'modal' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      </Stack.Group>

      <Stack.Screen
        name="BlockOverlay"
        component={BlockOverlayScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
