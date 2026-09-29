import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Home: undefined;
  Sessions: undefined;
  Schedules: undefined;
  ScreenTime: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Permissions: { fromSettings?: boolean } | undefined;
  AppSelection: { fromOnboarding?: boolean } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  BlockOverlay: { appId: string; preview?: boolean };
  AppUsageDetail: { appId: string };
  ScheduleEditor:
    | {
        scheduleId?: string;
        /** Apps already picked on the app-selection screen; skips the in-screen app step. */
        appIds?: string[];
        fromOnboarding?: boolean;
      }
    | undefined;
  BlockScreenCustomize: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  ContactSupport: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
