import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import type { ThemePreference } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabScreenProps } from '@/navigation/types';

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
  const { settings, updateSettings } = useSettings();
  const { permissions, blockedAppIds, schedules } = useBlocker();

  const grantedCount = Object.values(permissions).filter(Boolean).length;
  const permissionTotal = Object.keys(permissions).length;

  const toggleStrictMode = (value: boolean) => {
    if (!value) {
      updateSettings({ strictMode: false });
      return;
    }
    Alert.alert(
      'Turn on strict mode?',
      'You will not be able to end focus sessions early or edit active schedules.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Turn on', onPress: () => updateSettings({ strictMode: true }) },
      ]
    );
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
            subtitle="No ending sessions early"
            switchValue={settings.strictMode}
            onSwitchChange={toggleStrictMode}
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
            <View style={[styles.themeIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="contrast" size={18} color={colors.primary} />
            </View>
            <AppText variant="label" numberOfLines={1} style={styles.themeTitle}>
              Appearance
            </AppText>
            <View style={[styles.segment, { backgroundColor: colors.background }]}>
              {ThemeOptions.map((o) => {
                const selected = settings.themePreference === o.id;
                return (
                  <Pressable
                    key={o.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => updateSettings({ themePreference: o.id })}
                    style={[styles.segmentItem, selected && { backgroundColor: colors.primary }]}>
                    <AppText
                      variant="caption"
                      style={[styles.segmentLabel, { color: selected ? colors.white : colors.textSecondary }]}>
                      {o.label}
                    </AppText>
                  </Pressable>
                );
              })}
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
          <ListRow icon="information-circle" title="About Us" onPress={() => navigation.navigate('About')} />
          <ListRow
            icon="shield-checkmark"
            title="Privacy policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <ListRow icon="document-text" title="Terms of service" onPress={() => navigation.navigate('Terms')} />
          <ListRow icon="mail" title="Contact support" onPress={() => navigation.navigate('ContactSupport')} />
          <ListRow icon="pricetag" title="Version" value={AppConfig.version} />
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
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  themeIcon: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  themeTitle: { flex: 1 },
  segment: { flexDirection: 'row', padding: 3, borderRadius: Radius.full },
  segmentItem: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 6, borderRadius: Radius.full },
  segmentLabel: { fontWeight: '600' },
});
