import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { Stepper } from '@/components/ui/stepper';
import { Spacing } from '@/constants/theme';
import type { IconName, UnlockMethod } from '@/constants/types';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/navigation/types';

const Methods: { id: UnlockMethod; icon: IconName; title: string; description: string }[] = [
  { id: 'timer', icon: 'hourglass', title: 'Wait timer', description: 'Wait a few seconds before you can unlock.' },
  { id: 'pin', icon: 'keypad', title: 'PIN code', description: 'Enter your PIN to unlock an app.' },
  { id: 'none', icon: 'flash', title: 'Instant', description: 'Unlock right away (least effective).' },
];

export function UnlockSettingsScreen({ navigation }: RootStackScreenProps<'UnlockSettings'>) {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettings();

  const selectMethod = (method: UnlockMethod) => {
    if (method === 'pin' && !settings.pin) {
      navigation.navigate('PinSetup');
      return;
    }
    updateSettings({ unlockMethod: method });
  };

  return (
    <Screen scroll edges={['bottom']} contentStyle={styles.content}>
      <AppText variant="caption" color="textMuted">
        HOW TO UNLOCK
      </AppText>
      <ListGroup>
        {Methods.map((m) => {
          const selected = settings.unlockMethod === m.id;
          return (
            <Pressable key={m.id} onPress={() => selectMethod(m.id)} style={styles.method}>
              <Ionicons name={m.icon} size={22} color={colors.primary} />
              <View style={styles.methodText}>
                <AppText variant="label">{m.title}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {m.description}
                </AppText>
              </View>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected ? colors.primary : colors.textMuted}
              />
            </Pressable>
          );
        })}
      </ListGroup>

      {settings.unlockMethod === 'timer' && (
        <Card style={styles.row}>
          <View style={styles.rowText}>
            <AppText variant="label">Wait time</AppText>
            <AppText variant="caption" color="textSecondary">
              Seconds before unlock is allowed
            </AppText>
          </View>
          <Stepper
            value={settings.unlockWaitSeconds}
            onChange={(unlockWaitSeconds) => updateSettings({ unlockWaitSeconds })}
            min={5}
            max={120}
            step={5}
            format={(v) => `${v}s`}
          />
        </Card>
      )}

      {settings.pin && (
        <ListGroup>
          <ListRow icon="keypad" title="Change PIN" onPress={() => navigation.navigate('PinSetup')} />
        </ListGroup>
      )}

      <Card style={styles.row}>
        <View style={styles.rowText}>
          <AppText variant="label">Unlocks per day</AppText>
          <AppText variant="caption" color="textSecondary">
            Maximum temporary unlocks
          </AppText>
        </View>
        <Stepper
          value={settings.maxUnlocksPerDay}
          onChange={(maxUnlocksPerDay) => updateSettings({ maxUnlocksPerDay })}
          min={0}
          max={20}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  method: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  methodText: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowText: { flex: 1, gap: 2 },
});
