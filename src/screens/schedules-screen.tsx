import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ScheduleCard } from '@/components/schedule-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useBlocker } from '@/context/blocker-context';
import { useScheduleToggle } from '@/hooks/use-schedule-toggle';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabScreenProps } from '@/navigation/types';

export function SchedulesScreen({ navigation }: MainTabScreenProps<'Schedules'>) {
  const { colors } = useTheme();
  const { schedules, getScheduleApps, now } = useBlocker();
  const toggleSchedule = useScheduleToggle();
  const canAdd = schedules.length < AppConfig.limits.maxSchedules;

  return (
    <Screen scroll>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <AppText variant="title">Schedules</AppText>
          <AppText color="textSecondary">Pick apps and a time. They will be blocked automatically.</AppText>
        </View>
        {canAdd && (
          <Pressable
            onPress={() => navigation.navigate('ScheduleEditor')}
            style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={24} color={colors.white} />
          </Pressable>
        )}
      </View>

      {schedules.length === 0 ? (
        <EmptyState
          icon="alarm"
          title="No blocks scheduled"
          description="Example: block Instagram and YouTube today from 5:00 PM to 8:00 PM."
          action={<Button title="Block at a custom time" icon="add" onPress={() => navigation.navigate('ScheduleEditor')} />}
        />
      ) : (
        schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            apps={getScheduleApps(schedule)}
            now={now}
            onPress={() => navigation.navigate('ScheduleEditor', { scheduleId: schedule.id })}
            onToggle={() => toggleSchedule(schedule)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.md, gap: Spacing.md },
  titleText: { flex: 1, gap: Spacing.xs },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
