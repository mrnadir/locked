import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { WeekDays } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import type { InstalledApp, Schedule } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { getNextWindow, getScheduleActiveUntil } from '@/utils/block-status';
import { formatClock, formatDayLabel, formatMinutes, parseDateKey } from '@/utils/format';

interface ScheduleCardProps {
  schedule: Schedule;
  apps: InstalledApp[];
  now: number;
  onPress: () => void;
  onToggle: () => void;
}

const MAX_ICONS = 5;

export function describeDays(days: number[]): string {
  if (days.length === 7) return 'Every day';
  const sorted = [...days].sort();
  if (sorted.join() === '1,2,3,4,5') return 'Weekdays';
  if (sorted.join() === '0,6') return 'Weekends';
  return sorted.map((d) => WeekDays[d]).join(', ');
}

export function describeRepeat(schedule: Schedule, now: Date): string {
  if (schedule.date) return `${formatDayLabel(parseDateKey(schedule.date).getTime(), now)} · Once`;
  return describeDays(schedule.days);
}

export function ScheduleCard({ schedule, apps, now, onPress, onToggle }: ScheduleCardProps) {
  const { colors } = useTheme();
  const nowDate = new Date(now);
  const activeUntil = getScheduleActiveUntil(schedule, nowDate);
  const next = getNextWindow(schedule, nowDate);

  let status: { text: string; color: 'success' | 'primary' | 'textMuted' } | null = null;
  if (activeUntil !== null) {
    status = { text: `Blocking · ${formatMinutes(Math.ceil((activeUntil - now) / 60_000))} left`, color: 'success' };
  } else if (schedule.enabled && next) {
    status = { text: `Starts in ${formatMinutes(Math.ceil((next.start - now) / 60_000))}`, color: 'primary' };
  } else if (!next) {
    status = { text: 'Finished', color: 'textMuted' };
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: activeUntil !== null ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons
            name={schedule.date ? 'alarm' : schedule.startMinutes > schedule.endMinutes ? 'moon' : 'sunny'}
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.texts}>
          <AppText variant="label" numberOfLines={1}>
            {schedule.name}
          </AppText>
          <AppText variant="heading">
            {formatClock(schedule.startMinutes)} – {formatClock(schedule.endMinutes)}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {describeRepeat(schedule, nowDate)}
          </AppText>
        </View>
        <Switch
          value={schedule.enabled}
          onValueChange={onToggle}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.white}
        />
      </View>

      <View style={[styles.bottom, { borderTopColor: colors.border }]}>
        <View style={styles.appIcons}>
          {apps.slice(0, MAX_ICONS).map((app) => (
            <AppIcon key={app.id} app={app} size={24} />
          ))}
          <AppText variant="caption" color="textSecondary">
            {apps.length > MAX_ICONS ? `+${apps.length - MAX_ICONS} · ` : ''}
            {apps.length} {apps.length === 1 ? 'app' : 'apps'}
          </AppText>
        </View>
        {status && (
          <AppText variant="caption" color={status.color} style={styles.status}>
            {status.text}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, gap: Spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  appIcons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexShrink: 1 },
  status: { fontWeight: '700' },
});
