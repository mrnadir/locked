import { AppConfig } from '@config';
import { useLayoutEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { StatTile } from '@/components/stat-tile';
import { UsageBarChart } from '@/components/usage-bar-chart';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { WeekDays } from '@/constants/content';
import { Spacing } from '@/constants/theme';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import type { RootStackScreenProps } from '@/navigation/types';
import { simulateAppOpen } from '@/utils/app-blocker';
import { formatMinutes } from '@/utils/format';

export function AppUsageDetailScreen({ navigation, route }: RootStackScreenProps<'AppUsageDetail'>) {
  const { appId } = route.params;
  const { settings } = useSettings();
  const { getApp, usage, blockedAppIds, toggleBlockedApp, blockStatus } = useBlocker();
  const app = getApp(appId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: app?.name ?? 'App' });
  }, [navigation, app?.name]);

  if (!app) {
    return (
      <Screen edges={['bottom']}>
        <EmptyState icon="help-circle" title="App not found" />
      </Screen>
    );
  }

  const daily = usage.map((d) => ({
    label: WeekDays[new Date(`${d.date}T12:00:00`).getDay()].charAt(0),
    entry: d.apps.find((a) => a.appId === appId),
  }));
  const todayEntry = daily.at(-1)?.entry;
  const weekMinutes = daily.reduce((s, d) => s + (d.entry?.minutes ?? 0), 0);
  const weekOpens = daily.reduce((s, d) => s + (d.entry?.opens ?? 0), 0);
  const isBlocked = blockedAppIds.includes(appId);

  const onToggleBlock = () => {
    if (isBlocked && settings.strictMode && blockStatus.active) {
      Alert.alert('Strict mode is on', 'You cannot unblock apps while blocking is active.');
      return;
    }
    if (!toggleBlockedApp(appId)) {
      Alert.alert('Limit reached', `You can block up to ${AppConfig.limits.maxBlockedApps} apps.`);
    }
  };

  const tryOpen = () => {
    if (!simulateAppOpen(appId)) {
      Alert.alert(`${app.name} opened`, isBlocked ? 'Blocking is not active right now.' : 'This app is not blocked.');
    }
  };

  return (
    <Screen scroll edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <AppIcon app={app} size={72} />
        <AppText variant="title">{app.name}</AppText>
        <AppText color="textSecondary">{app.category.charAt(0).toUpperCase() + app.category.slice(1)}</AppText>
      </View>

      <View style={styles.tiles}>
        <StatTile icon="today" label="Today" value={formatMinutes(todayEntry?.minutes ?? 0)} tint={app.color} />
        <StatTile icon="calendar" label="Daily avg" value={formatMinutes(usage.length ? weekMinutes / usage.length : 0)} tint={app.color} />
        <StatTile icon="hand-left" label="Opens (7d)" value={String(weekOpens)} tint={app.color} />
      </View>

      <Card style={styles.chartCard}>
        <AppText variant="heading">Last 7 days</AppText>
        <UsageBarChart data={daily.map((d) => ({ label: d.label, minutes: d.entry?.minutes ?? 0 }))} color={app.color} />
      </Card>

      <ListGroup>
        <ListRow
          icon="lock-closed"
          title="Block this app"
          subtitle={isBlocked ? 'Included in your block list' : 'Not blocked'}
          switchValue={isBlocked}
          onSwitchChange={onToggleBlock}
        />
      </ListGroup>

      {AppConfig.useMockNativeModule && (
        <Button title={`Simulate opening ${app.name}`} variant="secondary" icon="open-outline" onPress={tryOpen} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  header: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  tiles: { flexDirection: 'row', gap: Spacing.sm },
  chartCard: { gap: Spacing.lg },
});
