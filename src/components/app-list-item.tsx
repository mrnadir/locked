import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';
import type { InstalledApp } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';

interface AppListItemProps {
  app: InstalledApp;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
  right?: ReactNode;
}

export function AppListItem({ app, subtitle, selected, onPress, right }: AppListItemProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected ? colors.primarySoft : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <AppIcon app={app} />
      <View style={styles.texts}>
        <AppText variant="label" numberOfLines={1}>
          {app.name}
        </AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {subtitle ?? app.category.charAt(0).toUpperCase() + app.category.slice(1)}
        </AppText>
      </View>
      {right ??
        (selected !== undefined && (
          <View
            style={[
              styles.check,
              selected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { borderColor: colors.textMuted },
            ]}>
            {selected && <Ionicons name="checkmark" size={16} color={colors.white} />}
          </View>
        ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  texts: { flex: 1, gap: 2 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
