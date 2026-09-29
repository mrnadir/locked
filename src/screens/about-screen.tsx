import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Device from 'expo-device';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AboutScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Ionicons name="lock-closed" size={40} color={colors.white} />
        </View>
        <AppText variant="title">{AppConfig.name}</AppText>
        <AppText color="textSecondary">Version {AppConfig.version}</AppText>
      </View>

      <Card>
        <AppText color="textSecondary">
          {AppConfig.name} helps you block distracting apps, build focus habits and understand your
          screen time. Everything is stored on your device.
        </AppText>
      </Card>

      <ListGroup>
        <ListRow icon="phone-portrait" title="Device" value={Device.modelName ?? 'Unknown'} />
        <ListRow
          icon="hardware-chip"
          title="System"
          value={`${Device.osName ?? Platform.OS} ${Device.osVersion ?? ''}`.trim()}
        />
        <ListRow
          icon="construct"
          title="Blocking engine"
          value={AppConfig.useMockNativeModule ? 'Simulated' : 'Native'}
        />
      </ListGroup>

      <AppText variant="caption" color="textMuted" align="center">
        Made with care by Sparktech
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.xl },
  header: { alignItems: 'center', gap: Spacing.xs },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
});
