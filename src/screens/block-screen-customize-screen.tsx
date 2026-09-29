import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BlockScreenView } from '@/components/block-screen-view';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { MockInstalledApps } from '@/constants/apps';
import { MotivationalQuotes } from '@/constants/content';
import { AccentChoices, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBlocker } from '@/context/blocker-context';
import { DefaultSettings, useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/navigation/types';

const MESSAGE_MAX = 80;

export function BlockScreenCustomizeScreen({ navigation }: RootStackScreenProps<'BlockScreenCustomize'>) {
  const { colors } = useTheme();
  const { settings, updateBlockScreen } = useSettings();
  const { blockedAppIds, getApp } = useBlocker();
  const look = settings.blockScreen;
  const previewApp = getApp(blockedAppIds[0] ?? '') ?? MockInstalledApps[0];

  return (
    <Screen scroll edges={['bottom']} contentStyle={styles.content}>
      <BlockScreenView
        compact
        app={previewApp}
        look={look}
        statusLabel="Focus session · unlocks in"
        remainingMs={42 * 60_000}
        quote={MotivationalQuotes[0]}
      />

      <Button
        title="Open full preview"
        variant="secondary"
        icon="expand"
        onPress={() => navigation.navigate('BlockOverlay', { appId: previewApp.id, preview: true })}
      />

      <View style={styles.field}>
        <AppText variant="label" color="textSecondary">
          Message
        </AppText>
        <TextInput
          value={look.message}
          onChangeText={(message) => updateBlockScreen({ message: message.slice(0, MESSAGE_MAX) })}
          placeholder="Write something to motivate yourself"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
        />
        <AppText variant="caption" color="textMuted" align="right">
          {look.message.length}/{MESSAGE_MAX}
        </AppText>
      </View>

      <View style={styles.field}>
        <AppText variant="label" color="textSecondary">
          Color
        </AppText>
        <View style={styles.swatches}>
          {AccentChoices.map((color) => (
            <Pressable
              key={color}
              onPress={() => updateBlockScreen({ accentColor: color })}
              style={[
                styles.swatch,
                { backgroundColor: color },
                look.accentColor === color && { borderColor: colors.text, borderWidth: 3 },
              ]}>
              {look.accentColor === color && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
            </Pressable>
          ))}
        </View>
      </View>

      <ListGroup>
        <ListRow
          icon="timer"
          title="Show countdown"
          switchValue={look.showCountdown}
          onSwitchChange={(showCountdown) => updateBlockScreen({ showCountdown })}
        />
        <ListRow
          icon="chatbox-ellipses"
          title="Show motivational quote"
          switchValue={look.showQuote}
          onSwitchChange={(showQuote) => updateBlockScreen({ showQuote })}
        />
      </ListGroup>

      <Button title="Reset to default" variant="ghost" onPress={() => updateBlockScreen(DefaultSettings.blockScreen)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  field: { gap: Spacing.sm },
  input: {
    minHeight: 80,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: FontSize.md,
    textAlignVertical: 'top',
  },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
