import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type { IconName } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabParamList } from '@/navigation/types';
import { HomeScreen } from '@/screens/home-screen';
import { SchedulesScreen } from '@/screens/schedules-screen';
import { SessionsScreen } from '@/screens/sessions-screen';
import { ScreenTimeScreen } from '@/screens/screen-time-screen';
import { SettingsScreen } from '@/screens/settings-screen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcons: Record<keyof MainTabParamList, [IconName, IconName]> = {
  Home: ['home', 'home-outline'],
  Sessions: ['timer', 'timer-outline'],
  Schedules: ['calendar', 'calendar-outline'],
  ScreenTime: ['stats-chart', 'stats-chart-outline'],
  Settings: ['settings', 'settings-outline'],
};

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TabIcons[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Schedules" component={SchedulesScreen} />
      <Tab.Screen name="ScreenTime" component={ScreenTimeScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
