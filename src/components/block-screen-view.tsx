import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';
import type { BlockScreenStyle, InstalledApp } from '@/constants/types';
import { formatCountdown } from '@/utils/format';

interface BlockScreenViewProps {
  app: InstalledApp;
  look: BlockScreenStyle;
  statusLabel: string;
  remainingMs: number | null;
  quote: string;
  compact?: boolean;
  children?: ReactNode;
}

const WHITE_70 = 'rgba(255,255,255,0.72)';

export function BlockScreenView({
  app,
  look,
  statusLabel,
  remainingMs,
  quote,
  compact,
  children,
}: BlockScreenViewProps) {
  const scale = compact ? 0.7 : 1;

  return (
    <View style={[styles.root, { backgroundColor: look.accentColor }, compact && styles.compact]}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <AppIcon app={app} size={84 * scale} />
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16 * scale} color={look.accentColor} />
          </View>
        </View>

        <AppText variant={compact ? 'heading' : 'title'} align="center" style={styles.white}>
          {app.name} is blocked
        </AppText>
        <AppText variant={compact ? 'caption' : 'body'} align="center" style={{ color: WHITE_70 }}>
          {look.message}
        </AppText>

        {look.showCountdown && (
          <View style={styles.timerBox}>
            <AppText variant="caption" align="center" style={{ color: WHITE_70 }}>
              {statusLabel}
            </AppText>
            {remainingMs !== null && (
              <AppText
                variant={compact ? 'title' : 'display'}
                align="center"
                style={[styles.white, styles.timer]}>
                {formatCountdown(remainingMs)}
              </AppText>
            )}
          </View>
        )}

        {look.showQuote && (
          <View style={styles.quote}>
            <Ionicons name="chatbox-ellipses-outline" size={18 * scale} color={WHITE_70} />
            <AppText variant={compact ? 'caption' : 'label'} align="center" style={{ color: WHITE_70 }}>
              “{quote}”
            </AppText>
          </View>
        )}
      </View>

      {children && <View style={styles.actions}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', padding: Spacing.xl, justifyContent: 'space-between' },
  compact: { flex: 0, borderRadius: Radius.xl, padding: Spacing.lg, minHeight: 380 },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  blobTop: { width: 320, height: 320, top: -120, right: -100 },
  blobBottom: { width: 260, height: 260, bottom: -90, left: -110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  iconWrap: { marginBottom: Spacing.sm },
  lockBadge: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    padding: 6,
  },
  white: { color: '#FFFFFF' },
  timerBox: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0,0,0,0.15)',
    gap: Spacing.xs,
  },
  timer: { fontVariant: ['tabular-nums'] },
  quote: { marginTop: Spacing.md, alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.lg },
  actions: { gap: Spacing.sm },
});
