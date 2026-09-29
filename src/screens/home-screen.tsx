import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppListItem } from '@/components/app-list-item';
import { BlockStatusCard } from '@/components/block-status-card';
import { ScheduleCard } from '@/components/schedule-card';
import { StatTile } from '@/components/stat-tile';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { useScheduleToggle } from '@/hooks/use-schedule-toggle';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabScreenProps } from '@/navigation/types';
import { simulateAppOpen } from '@/utils/app-blocker';
import { getNextWindow } from '@/utils/block-status';
import { formatMinutes, greeting } from '@/utils/format';

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const {
    blockStatus,
    focusSession,
    blockedAppIds,
    activeBlockedAppIds,
    installedApps,
    alwaysOn,
    setAlwaysOn,
    startFocus,
    stopFocus,
    usage,
    refreshUsage,
    getApp,
    unlocksUsedToday,
    schedules,
    getScheduleApps,
    now,
  } = useBlocker();
  const toggleSchedule = useScheduleToggle();
  const [focusMinutes, setFocusMinutes] = useState<number>(AppConfig.focusDurationsMinutes[1]);

  useEffect(() => {
    if (usage.length === 0) refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = usage.at(-1);
  const blockedApps = blockedAppIds.map(getApp).filter((a) => a !== undefined);
  const upcoming = schedules
    .filter((s) => s.enabled)
    .map((schedule) => ({ schedule, window: getNextWindow(schedule, new Date(now)) }))
    .filter((u) => u.window !== null)
    .sort((a, b) => (a.window?.start ?? 0) - (b.window?.start ?? 0));
  const unlocksLeft = settings.strictMode ? 0 : Math.max(0, settings.maxUnlocksPerDay - unlocksUsedToday);

  const confirmStop = () => {
    if (settings.strictMode) {
      Alert.alert('Strict mode is on', 'You cannot end a focus session early while strict mode is enabled.');
      return;
    }
    Alert.alert('End focus session?', 'Your blocked apps will become available again.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'End session', style: 'destructive', onPress: stopFocus },
    ]);
  };

  const tryOpen = (appId: string) => {
    if (simulateAppOpen(appId)) return;
    const app = getApp(appId);
    Alert.alert(
      `${app?.name ?? 'App'} opened`,
      'Blocking is not active right now, so this app would open normally.',
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Preview block screen', onPress: () => navigation.navigate('BlockOverlay', { appId, preview: true }) },
      ]
    );
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText color="textSecondary">{greeting()}</AppText>
          <AppText variant="title">{settings.userName || 'Welcome back'}</AppText>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="person" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <BlockStatusCard
        status={blockStatus}
        focusSession={focusSession}
        blockedCount={blockStatus.active ? activeBlockedAppIds.length : blockedAppIds.length}
        totalApps={installedApps.length}
        onStopFocus={confirmStop}
      />

      {blockStatus.reason !== 'focus' && (
        <Card style={styles.focusCard}>
          <View style={styles.focusTitle}>
            <Ionicons name="timer-outline" size={22} color={colors.primary} />
            <AppText variant="heading">Start a focus session</AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {AppConfig.focusDurationsMinutes.map((m) => (
              <Chip key={m} label={formatMinutes(m)} selected={focusMinutes === m} onPress={() => setFocusMinutes(m)} />
            ))}
          </ScrollView>
          <Button
            title={`Focus for ${formatMinutes(focusMinutes)}`}
            icon="play"
            disabled={blockedAppIds.length === 0}
            onPress={() => startFocus(focusMinutes)}
          />
          {blockedAppIds.length === 0 && (
            <AppText variant="caption" color="textMuted" align="center">
              Add apps to your block list first.
            </AppText>
          )}
        </Card>
      )}

      <Pressable onPress={() => navigation.navigate('ScheduleEditor')}>
        <Card style={styles.customCard}>
          <View style={[styles.customIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="alarm" size={24} color={colors.primary} />
          </View>
          <View style={styles.customText}>
            <AppText variant="heading">Block at a custom time</AppText>
            <AppText variant="caption" color="textSecondary">
              Pick apps, then choose a time, e.g. 5:00 PM – 8:00 PM
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Card>
      </Pressable>

      {upcoming.length > 0 && (
        <>
          <SectionHeader
            title="Scheduled blocks"
            actionLabel="See all"
            onAction={() => navigation.navigate('Schedules')}
          />
          {upcoming.slice(0, 3).map(({ schedule }) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              apps={getScheduleApps(schedule)}
              now={now}
              onPress={() => navigation.navigate('ScheduleEditor', { scheduleId: schedule.id })}
              onToggle={() => toggleSchedule(schedule)}
            />
          ))}
        </>
      )}

      <ListGroup>
        <ListRow
          icon="infinite"
          title="Always block"
          subtitle="Keep blocked apps locked all the time"
          switchValue={alwaysOn}
          onSwitchChange={setAlwaysOn}
        />
      </ListGroup>

      <View style={styles.tiles}>
        <StatTile icon="phone-portrait" label="Screen time today" value={formatMinutes(today?.totalMinutes ?? 0)} />
        <StatTile icon="key" label="Unlocks left" value={String(unlocksLeft)} tint={colors.warning} />
      </View>

      <SectionHeader
        title="Blocked apps"
        actionLabel={blockedApps.length > 0 ? 'Manage' : 'Add'}
        onAction={() => navigation.navigate('AppSelection')}
      />
      {blockedApps.length === 0 ? (
        <Card>
          <AppText color="textSecondary" align="center">
            No apps blocked yet.
          </AppText>
        </Card>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.appRow}>
            {blockedApps.map((app) => (
              <Pressable key={app.id} onPress={() => tryOpen(app.id)} style={styles.appCell}>
                <AppIcon app={app} size={52} />
                <AppText variant="caption" numberOfLines={1}>
                  {app.name}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
          {AppConfig.useMockNativeModule && (
            <AppText variant="caption" color="textMuted">
              Tap an app to simulate opening it.
            </AppText>
          )}
        </>
      )}

      {today && today.apps.length > 0 && (
        <>
          <SectionHeader
            title="Most used today"
            actionLabel="See all"
            onAction={() => navigation.navigate('ScreenTime')}
          />
          {today.apps.slice(0, 3).map((entry) => {
            const app = getApp(entry.appId);
            if (!app) return null;
            return (
              <AppListItem
                key={entry.appId}
                app={app}
                subtitle={`${entry.opens} opens`}
                onPress={() => navigation.navigate('AppUsageDetail', { appId: app.id })}
                right={<AppText variant="label">{formatMinutes(entry.minutes)}</AppText>}
              />
            );
          })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.md },
  headerText: { flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  focusCard: { gap: Spacing.md },
  customCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  customIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  customText: { flex: 1, gap: 2 },
  focusTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chips: { gap: Spacing.sm },
  tiles: { flexDirection: 'row', gap: Spacing.md },
  appRow: { gap: Spacing.lg },
  appCell: { alignItems: 'center', gap: Spacing.xs, width: 64 },
});
