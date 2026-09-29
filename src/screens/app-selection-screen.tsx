import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { AppListItem } from '@/components/app-list-item';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { AppCategories } from '@/constants/apps';
import { Spacing } from '@/constants/theme';
import type { AppCategory } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/navigation/types';

const MAX = AppConfig.limits.maxBlockedApps;

export function AppSelectionScreen({ navigation, route }: RootStackScreenProps<'AppSelection'>) {
  const fromOnboarding = route.params?.fromOnboarding ?? false;
  const { colors } = useTheme();
  const { installedApps, blockedAppIds, setBlockedApps, loadInstalledApps } = useBlocker();
  const { completeOnboarding } = useSettings();

  const [scanning, setScanning] = useState(fromOnboarding);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AppCategory | 'all'>('all');
  const [selected, setSelected] = useState<string[]>(blockedAppIds);

  useEffect(() => {
    if (!fromOnboarding) return;
    loadInstalledApps().finally(() => setScanning(false));
    // Only scan once when the screen opens during onboarding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.trim().toLowerCase();
  const visibleApps = installedApps.filter(
    (app) =>
      (category === 'all' || app.category === category) &&
      (q === '' || app.name.toLowerCase().includes(q))
  );

  const toggle = (appId: string) => {
    if (selected.includes(appId)) {
      setSelected(selected.filter((id) => id !== appId));
      return;
    }
    if (selected.length >= MAX) {
      Alert.alert('Limit reached', `You can block up to ${MAX} apps at a time.`);
      return;
    }
    setSelected([...selected, appId]);
  };

  const save = () => {
    setBlockedApps(selected);
    if (selected.length > 0) {
      navigation.navigate('ScheduleEditor', { appIds: selected, fromOnboarding });
    } else if (fromOnboarding) {
      completeOnboarding();
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } else {
      navigation.goBack();
    }
  };

  if (scanning) {
    return (
      <Screen edges={['top', 'bottom']} contentStyle={styles.scanning}>
        <View style={[styles.scanIcon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="apps" size={40} color={colors.primary} />
        </View>
        <AppText variant="title" align="center">
          Scanning your apps
        </AppText>
        <AppText color="textSecondary" align="center">
          Finding installed apps on this device…
        </AppText>
        <ActivityIndicator size="large" color={colors.primary} style={styles.scanLoader} />
      </Screen>
    );
  }

  return (
    <Screen
      edges={fromOnboarding ? ['top', 'bottom'] : ['bottom']}
      padded={false}
      footer={
        <Button
          title={
            selected.length > 0
              ? `Continue · ${selected.length} apps`
              : fromOnboarding
                ? 'Continue without blocking'
                : 'Done'
          }
          icon={selected.length > 0 ? 'arrow-forward' : undefined}
          onPress={save}
          variant={selected.length === 0 ? 'secondary' : 'primary'}
        />
      }>
      <View style={styles.header}>
        {fromOnboarding && (
          <View style={styles.titleBlock}>
            <AppText variant="title">
              Choose apps to block
            </AppText>
            <AppText color="textSecondary">
              We found {installedApps.length} apps. Select the ones that distract you the most.
            </AppText>
          </View>
        )}

        <SearchBar value={query} onChangeText={setQuery} placeholder="Search apps" />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {AppCategories.map((c) => (
            <Chip key={c.id} label={c.label} selected={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visibleApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <AppListItem app={item} selected={selected.includes(item.id)} onPress={() => toggle(item.id)} />
        )}
        ListEmptyComponent={
          <EmptyState icon="search" title="No apps found" description="Try a different search or category." />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scanning: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  scanIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  scanLoader: { marginTop: Spacing.xl },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  titleBlock: { gap: Spacing.sm, paddingTop: Spacing.sm },
  chips: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
});
