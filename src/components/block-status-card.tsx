import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Radius, Spacing } from '@/constants/theme';
import type { BlockStatus, FocusSession } from '@/constants/types';
import { useCountdown } from '@/hooks/use-countdown';
import { useTheme } from '@/hooks/use-theme';
import { formatCountdown } from '@/utils/format';

interface BlockStatusCardProps {
  status: BlockStatus;
  focusSession: FocusSession | null;
  blockedCount: number;
  totalApps: number;
  onStopFocus?: () => void;
}

export function BlockStatusCard({
  status,
  focusSession,
  blockedCount,
  totalApps,
  onStopFocus,
}: BlockStatusCardProps) {
  const { colors } = useTheme();
  const remaining = useCountdown(status.until);
  const isFocus = status.reason === 'focus' && focusSession;
  const progress = isFocus
    ? 1 - remaining / (focusSession.endsAt - focusSession.startedAt)
    : 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: status.active ? colors.primary : colors.card, borderColor: colors.border },
      ]}>
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            { backgroundColor: status.active ? 'rgba(255,255,255,0.18)' : colors.primarySoft },
          ]}>
          <Ionicons
            name={status.active ? 'lock-closed' : 'lock-open'}
            size={22}
            color={status.active ? colors.white : colors.primary}
          />
        </View>
        <View style={styles.headerText}>
          <AppText variant="heading" style={status.active && { color: colors.white }}>
            {status.active ? 'Blocking is active' : 'Blocking is off'}
          </AppText>
          <AppText
            variant="caption"
            color="textSecondary"
            style={status.active && { color: 'rgba(255,255,255,0.8)' }}>
            {status.active ? status.label : 'Start a focus session or enable a schedule'}
          </AppText>
        </View>
      </View>

      {status.active && status.until !== null && (
        <AppText variant="display" style={[styles.timer, { color: colors.white }]}>
          {formatCountdown(remaining)}
        </AppText>
      )}

      {isFocus && <ProgressBar progress={progress} color={colors.white} height={6} />}

      <View style={styles.footer}>
        <AppText
          variant="label"
          color="textSecondary"
          style={status.active && { color: 'rgba(255,255,255,0.85)' }}>
          {blockedCount} of {totalApps} apps blocked
        </AppText>
        {isFocus && onStopFocus && (
          <Button
            title="End session"
            size="md"
            variant="ghost"
            color={colors.white}
            onPress={onStopFocus}
            style={styles.stopButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.lg, borderWidth: StyleSheet.hairlineWidth },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 2 },
  timer: { fontVariant: ['tabular-nums'] },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stopButton: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', height: 36 },
});
