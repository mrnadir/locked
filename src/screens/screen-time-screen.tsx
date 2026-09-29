import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatTile } from '@/components/stat-tile';
import { UsageBarChart } from '@/components/usage-bar-chart';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { WeekDays } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import type { AppUsage } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabScreenProps } from '@/navigation/types';
import { formatMinutes } from '@/utils/format';

type Range = 'today' | 'week';

export function ScreenTimeScreen({ navigation }: MainTabScreenProps<'ScreenTime'>) {
  const { colors } = useTheme();
  const { usage, usageLoading, refreshUsage, getApp, blockedAppIds } = useBlocker();
  const [range, setRange] = useState<Range>('today');

  useEffect(() => {
    if (usage.length === 0) refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = usage.at(-1);
  const yesterday = usage.at(-2);

  const weekTotals = new Map<string, AppUsage>();
  for (const day of usage) {
    for (const a of day.apps) {
      const prev = weekTotals.get(a.appId);
      weekTotals.set(a.appId, {
        appId: a.appId,
        minutes: (prev?.minutes ?? 0) + a.minutes,
        opens: (prev?.opens ?? 0) + a.opens,
      });
    }
  }

  const apps =
    range === 'today'
      ? (today?.apps ?? [])
      : [...weekTotals.values()].sort((a, b) => b.minutes - a.minutes);
  const totalMinutes = apps.reduce((s, a) => s + a.minutes, 0);
  const totalOpens = apps.reduce((s, a) => s + a.opens, 0);
  const dailyAverage = usage.length ? Math.round(totalMinutes / usage.length) : 0;
  const topMinutes = apps[0]?.minutes ?? 1;

  const chartData = usage.map((d) => ({
    label: WeekDays[new Date(`${d.date}T12:00:00`).getDay()].charAt(0),
    minutes: d.totalMinutes,
  }));

  let comparison: string | null = null;
  if (range === 'today' && today && yesterday && yesterday.totalMinutes > 0) {
    const diff = Math.round(((today.totalMinutes - yesterday.totalMinutes) / yesterday.totalMinutes) * 100);
    comparison = diff <= 0 ? `${Math.abs(diff)}% less than yesterday` : `${diff}% more than yesterday`;
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={usageLoading} onRefresh={refreshUsage} tintColor={colors.primary} />}>
        <AppText variant="title">Screen time</AppText>

        <View style={[styles.segment, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(['today', 'week'] as Range[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              style={[styles.segmentItem, range === r && { backgroundColor: colors.primary }]}>
              <AppText variant="label" style={{ color: range === r ? colors.white : colors.textSecondary }}>
                {r === 'today' ? 'Today' : 'Last 7 days'}
              </AppText>
            </Pressable>
          ))}
        </View>

        <Card style={styles.summary}>
          <AppText variant="caption" color="textSecondary">
            {range === 'today' ? 'Total today' : 'Daily average'}
          </AppText>
          <AppText variant="display">{formatMinutes(range === 'today' ? totalMinutes : dailyAverage)}</AppText>
          {comparison && (
            <View style={styles.comparison}>
              <Ionicons
                name={comparison.includes('less') ? 'trending-down' : 'trending-up'}
                size={16}
                color={comparison.includes('less') ? colors.success : colors.danger}
              />
              <AppText variant="caption" color={comparison.includes('less') ? 'success' : 'danger'}>
                {comparison}
              </AppText>
            </View>
          )}
          {usage.length > 0 && <UsageBarChart data={chartData} />}
        </Card>

        <View style={styles.tiles}>
          <StatTile icon="hand-left" label={range === 'today' ? 'Pickups today' : 'Pickups this week'} value={String(totalOpens)} />
          <StatTile
            icon="trophy"
            label="Most used"
            value={apps[0] ? (getApp(apps[0].appId)?.name ?? '—') : '—'}
            tint={colors.warning}
          />
        </View>

        <SectionHeader title="Apps" />
        {apps.length === 0 && !usageLoading ? (
          <EmptyState icon="stats-chart" title="No usage yet" description="Pull down to refresh." />
        ) : (
          <Card style={styles.appList}>
            {apps.map((entry) => {
              const app = getApp(entry.appId);
              if (!app) return null;
              return (
                <Pressable
                  key={entry.appId}
                  onPress={() => navigation.navigate('AppUsageDetail', { appId: app.id })}
                  style={({ pressed }) => [styles.appRow, pressed && { opacity: 0.7 }]}>
                  <AppIcon app={app} size={38} />
                  <View style={styles.appInfo}>
                    <View style={styles.appTitle}>
                      <AppText variant="label" numberOfLines={1} style={styles.flex}>
                        {app.name}
                        {blockedAppIds.includes(app.id) && (
                          <AppText variant="caption" color="danger">
                            {'  '}Blocked
                          </AppText>
                        )}
                      </AppText>
                      <AppText variant="label" color="textSecondary">
                        {formatMinutes(entry.minutes)}
                      </AppText>
                    </View>
                    <ProgressBar progress={entry.minutes / topMinutes} color={app.color} height={5} />
                  </View>
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  segment: { flexDirection: 'row', padding: 4, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.sm },
  summary: { gap: Spacing.sm },
  comparison: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  tiles: { flexDirection: 'row', gap: Spacing.md },
  appList: { gap: Spacing.lg },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  appInfo: { flex: 1, gap: Spacing.sm },
  appTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  flex: { flex: 1 },
});
