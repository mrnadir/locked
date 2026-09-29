import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { FontSize, Spacing } from '@/constants/theme';
import type { ThemePreference, UnlockMethod } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import { navigationRef } from '@/navigation/navigation-ref';
import type { MainTabScreenProps } from '@/navigation/types';
import { clearAll } from '@/utils/storage';

export const UnlockMethodLabels: Record<UnlockMethod, string> = {
  timer: 'Wait timer',
  pin: 'PIN code',
  none: 'Instant',
};

const ThemeOptions: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
      {children.toUpperCase()}
    </AppText>
  );
}

export function SettingsScreen({ navigation }: MainTabScreenProps<'Settings'>) {
  const { colors } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { permissions, resetBlocker, blockedAppIds, schedules } = useBlocker();

  const grantedCount = Object.values(permissions).filter(Boolean).length;
  const permissionTotal = Object.keys(permissions).length;

  const toggleStrictMode = (value: boolean) => {
    if (!value) {
      updateSettings({ strictMode: false });
      return;
    }
    Alert.alert(
      'Turn on strict mode?',
      'You will not be able to unlock apps, end focus sessions early, or edit active schedules.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Turn on', onPress: () => updateSettings({ strictMode: true }) },
      ]
    );
  };

  const resetAll = () => {
    Alert.alert('Reset all data?', 'This removes your block list, schedules and settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          resetBlocker();
          resetSettings();
          navigationRef.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <AppText variant="title" style={styles.title}>
        Settings
      </AppText>

      <Card style={styles.profile}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <AppText variant="heading" style={{ color: colors.white }}>
            {(settings.userName.trim().charAt(0) || 'L').toUpperCase()}
          </AppText>
        </View>
        <View style={styles.profileText}>
          <TextInput
            value={settings.userName}
            onChangeText={(userName) => updateSettings({ userName })}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            style={[styles.nameInput, { color: colors.text }]}
          />
          <AppText variant="caption" color="textSecondary">
            {blockedAppIds.length} apps blocked · {schedules.filter((s) => s.enabled).length} schedules on
          </AppText>
        </View>
        <Ionicons name="pencil" size={16} color={colors.textMuted} />
      </Card>

      <View>
        <SectionLabel>Blocking</SectionLabel>
        <ListGroup>
          <ListRow
            icon="shield"
            title="Strict mode"
            subtitle="No unlocking or ending sessions early"
            switchValue={settings.strictMode}
            onSwitchChange={toggleStrictMode}
          />
          <ListRow
            icon="key"
            title="Unlock rules"
            value={UnlockMethodLabels[settings.unlockMethod]}
            onPress={() => navigation.navigate('UnlockSettings')}
            disabled={settings.strictMode}
          />
          <ListRow
            icon="color-palette"
            title="Customize block screen"
            onPress={() => navigation.navigate('BlockScreenCustomize')}
          />
          <ListRow
            icon="checkmark-done"
            title="Permissions"
            value={`${grantedCount}/${permissionTotal}`}
            onPress={() => navigation.navigate('Permissions', { fromSettings: true })}
          />
        </ListGroup>
      </View>

      <View>
        <SectionLabel>Preferences</SectionLabel>
        <ListGroup>
          <View style={styles.themeRow}>
            <AppText variant="label">Appearance</AppText>
            <View style={styles.themeChips}>
              {ThemeOptions.map((o) => (
                <Chip
                  key={o.id}
                  label={o.label}
                  selected={settings.themePreference === o.id}
                  onPress={() => updateSettings({ themePreference: o.id })}
                />
              ))}
            </View>
          </View>
          <ListRow
            icon="notifications"
            title="Notifications"
            subtitle="Session start/end and schedule reminders"
            switchValue={settings.notificationsEnabled}
            onSwitchChange={(notificationsEnabled) => updateSettings({ notificationsEnabled })}
          />
        </ListGroup>
      </View>

      <View>
        <SectionLabel>About</SectionLabel>
        <ListGroup>
          <ListRow icon="information-circle" title={`About ${AppConfig.name}`} onPress={() => navigation.navigate('About')} />
          <ListRow
            icon="document-text"
            title="Privacy policy"
            onPress={() => WebBrowser.openBrowserAsync(AppConfig.privacyPolicyUrl)}
          />
          <ListRow
            icon="reader"
            title="Terms of service"
            onPress={() => WebBrowser.openBrowserAsync(AppConfig.termsUrl)}
          />
          <ListRow
            icon="mail"
            title="Contact support"
            onPress={() => Linking.openURL(`mailto:${AppConfig.supportEmail}`)}
          />
          <ListRow icon="pricetag" title="Version" value={AppConfig.version} />
        </ListGroup>
      </View>

      <View>
        <SectionLabel>Danger zone</SectionLabel>
        <ListGroup>
          <ListRow
            icon="refresh"
            title="Replay onboarding"
            onPress={() => navigationRef.reset({ index: 0, routes: [{ name: 'Onboarding' }] })}
          />
          <ListRow icon="trash" title="Reset all data" destructive onPress={resetAll} />
        </ListGroup>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { paddingTop: Spacing.md },
  sectionLabel: { marginBottom: Spacing.sm, marginLeft: Spacing.xs, letterSpacing: 0.8 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  profileText: { flex: 1, gap: 2 },
  nameInput: { fontSize: FontSize.lg, fontWeight: '700', paddingVertical: 0 },
  themeRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  themeChips: { flexDirection: 'row', gap: Spacing.sm },
});
