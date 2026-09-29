import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { describeRepeat } from '@/components/schedule-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { ProgressBar } from '@/components/ui/progress-bar';
import { WeekDays } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import type { InstalledApp, Schedule } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { getNextWindow, getScheduleActiveUntil } from '@/utils/block-status';
import { formatClock, formatMinutes } from '@/utils/format';

interface SessionCardProps {
  schedule: Schedule;
  apps: InstalledApp[];
  now: number;
  onPress: () => void;
  onEnd: () => void;
  onStart: () => void;
}

type StatusColor = 'success' | 'primary' | 'textMuted';

const MAX_ICONS = 4;
const DAY_MINUTES = 24 * 60;

function repeatBadges(schedule: Schedule, now: Date): string[] {
  if (schedule.date) return [describeRepeat(schedule, now)];
  if (schedule.days.length === 7) return ['Every day'];
  return [...schedule.days].sort().map((d) => WeekDays[d]);
}

export function SessionCard({ schedule, apps, now, onPress, onEnd, onStart }: SessionCardProps) {
  const { colors } = useTheme();
  const nowDate = new Date(now);
  const activeUntil = getScheduleActiveUntil(schedule, nowDate);
  const running = activeUntil !== null;
  const next = getNextWindow(schedule, nowDate);
  const duration =
    schedule.endMinutes > schedule.startMinutes
      ? schedule.endMinutes - schedule.startMinutes
      : DAY_MINUTES - schedule.startMinutes + schedule.endMinutes;

  let status: { label: string; detail: string | null; color: StatusColor };
  if (running) {
    status = {
      label: 'Running',
      detail: `${formatMinutes(Math.ceil((activeUntil - now) / 60_000))} left`,
      color: 'success',
    };
  } else if (!schedule.enabled) {
    status = { label: 'Ended', detail: null, color: 'textMuted' };
  } else if (next) {
    status = {
      label: 'Upcoming',
      detail: `Starts in ${formatMinutes(Math.ceil((next.start - now) / 60_000))}`,
      color: 'primary',
    };
  } else {
    status = { label: 'Finished', detail: null, color: 'textMuted' };
  }

  const tint = { success: colors.success, primary: colors.primary, textMuted: colors.textMuted }[status.color];
  const tintSoft = { success: colors.successSoft, primary: colors.primarySoft, textMuted: colors.border }[
    status.color
  ];
  const elapsed = running ? 1 - (activeUntil - now) / (duration * 60_000) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: running ? colors.success : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: tintSoft }]}>
          <Ionicons
            name={schedule.startMinutes > schedule.endMinutes ? 'moon' : 'sunny'}
            size={20}
            color={tint}
          />
        </View>
        <View style={styles.texts}>
          <AppText variant="label" color="textSecondary" numberOfLines={1}>
            {schedule.name}
          </AppText>
          <AppText variant="heading">
            {formatClock(schedule.startMinutes)} – {formatClock(schedule.endMinutes)}
          </AppText>
        </View>
        <View style={[styles.pill, { backgroundColor: tintSoft }]}>
          <View style={[styles.pillDot, { backgroundColor: tint }]} />
          <AppText variant="caption" style={[styles.bold, { color: tint }]}>
            {status.label}
          </AppText>
        </View>
      </View>

      <View style={styles.badges}>
        {repeatBadges(schedule, nowDate).map((label) => (
          <View key={label} style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <AppText variant="caption" color="primary" style={styles.bold}>
              {label}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="caption" color="textSecondary" numberOfLines={1}>
        {formatMinutes(duration)}
        {status.detail ? ` · ${status.detail}` : ''}
      </AppText>

      {running && <ProgressBar progress={elapsed} color={colors.success} height={4} />}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.apps}>
          {apps.slice(0, MAX_ICONS).map((app, i) => (
            <View
              key={app.id}
              style={[styles.appIcon, { borderColor: colors.card, marginLeft: i === 0 ? 0 : -8 }]}>
              <AppIcon app={app} size={26} />
            </View>
          ))}
          <AppText variant="caption" color="textSecondary" style={styles.appCount}>
            {apps.length > MAX_ICONS
              ? `+${apps.length - MAX_ICONS} more`
              : `${apps.length} ${apps.length === 1 ? 'app' : 'apps'}`}
          </AppText>
        </View>
        <Pressable
          onPress={schedule.enabled ? onEnd : onStart}
          hitSlop={6}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: schedule.enabled ? colors.dangerSoft : colors.primarySoft,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Ionicons
            name={schedule.enabled ? 'stop' : 'play'}
            size={14}
            color={schedule.enabled ? colors.danger : colors.primary}
          />
          <AppText
            variant="label"
            style={[styles.bold, { color: schedule.enabled ? colors.danger : colors.primary }]}>
            {schedule.enabled ? 'End' : 'Start'}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1.5, gap: Spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  bold: { fontWeight: '700' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  apps: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  appIcon: { borderWidth: 2, borderRadius: 10 },
  appCount: { marginLeft: Spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 32,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
});
