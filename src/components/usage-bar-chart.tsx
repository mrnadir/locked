import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMinutes } from '@/utils/format';

interface UsageBarChartProps {
  data: { label: string; minutes: number }[];
  highlightIndex?: number;
  color?: string;
  height?: number;
}

export function UsageBarChart({ data, highlightIndex, color, height = 140 }: UsageBarChartProps) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.minutes));
  const barColor = color ?? colors.primary;

  return (
    <View style={styles.wrap}>
      <View style={[styles.bars, { height }]}>
        {data.map((d, index) => {
          const highlighted = index === (highlightIndex ?? data.length - 1);
          return (
            <View key={`${d.label}-${index}`} style={styles.column}>
              {highlighted && (
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {formatMinutes(d.minutes)}
                </AppText>
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(4, (d.minutes / max) * 80)}%`,
                    backgroundColor: highlighted ? barColor : colors.primarySoft,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((d, index) => (
          <AppText key={`${d.label}-${index}`} variant="caption" color="textMuted" style={styles.label}>
            {d.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.xs, height: '100%' },
  bar: { width: '100%', borderRadius: Radius.sm },
  labels: { flexDirection: 'row', gap: Spacing.sm },
  label: { flex: 1, textAlign: 'center' },
});
