import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { PinSheet } from '@/components/pin-sheet';
import { SessionCard } from '@/components/session-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import type { Schedule } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabScreenProps } from '@/navigation/types';
import { getScheduleActiveUntil, isScheduleLocked } from '@/utils/block-status';

function sortSessions(list: Schedule[], now: Date): Schedule[] {
  const rank = (s: Schedule) => (getScheduleActiveUntil(s, now) !== null ? 0 : s.enabled ? 1 : 2);
  return [...list].sort((a, b) => rank(a) - rank(b) || a.startMinutes - b.startMinutes);
}

export function SessionsScreen({ navigation }: MainTabScreenProps<'Sessions'>) {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { schedules, toggleSchedule, getScheduleApps, now } = useBlocker();
  const [pendingEndId, setPendingEndId] = useState<string | null>(null);

  const nowDate = new Date(now);
  const sessions = sortSessions(schedules, nowDate);
  const runningCount = sessions.filter((s) => getScheduleActiveUntil(s, nowDate) !== null).length;

  const endSession = (schedule: Schedule) => {
    if (isScheduleLocked(schedule, settings.strictMode, new Date())) {
      if (settings.pin) setPendingEndId(schedule.id);
      else Alert.alert('Strict mode is on', 'This session is running and cannot be ended without a PIN.');
      return;
    }
    Alert.alert(`End “${schedule.name}”?`, 'It will stop and won’t run again until you start it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End session', style: 'destructive', onPress: () => toggleSchedule(schedule.id) },
    ]);
  };

  const openEditor = (scheduleId?: string) =>
    navigation.navigate('ScheduleEditor', scheduleId ? { scheduleId } : undefined);

  return (
    <Screen scroll>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <AppText variant="title">Sessions</AppText>
          <AppText color="textSecondary">
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
            {runningCount > 0 ? ` · ${runningCount} running` : ''}
          </AppText>
        </View>
        <Pressable
          onPress={() => openEditor()}
          accessibilityLabel="New session"
          style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={24} color={colors.white} />
        </Pressable>
      </View>

      {sessions.length === 0 ? (
        <EmptyState
          icon="timer-outline"
          title="No sessions yet"
          description="Create a session to block apps at the times you choose."
          action={<Button title="New session" icon="add" onPress={() => openEditor()} />}
        />
      ) : (
        sessions.map((schedule) => (
          <SessionCard
            key={schedule.id}
            schedule={schedule}
            apps={getScheduleApps(schedule)}
            now={now}
            onPress={() => openEditor(schedule.id)}
            onEnd={() => endSession(schedule)}
            onStart={() => toggleSchedule(schedule.id)}
          />
        ))
      )}

      <PinSheet
        visible={pendingEndId !== null}
        expectedPin={settings.pin}
        hint="To end this session"
        onClose={() => setPendingEndId(null)}
        onSuccess={() => {
          if (pendingEndId) toggleSchedule(pendingEndId);
          setPendingEndId(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.md, gap: Spacing.md },
  titleText: { flex: 1, gap: Spacing.xs },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
