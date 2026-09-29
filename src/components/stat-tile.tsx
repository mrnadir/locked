import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';

interface StatTileProps {
  icon: IconName;
  label: string;
  value: string;
  tint?: string;
}

export function StatTile({ icon, label, value, tint }: StatTileProps) {
  const { colors } = useTheme();
  const color = tint ?? colors.primary;
  return (
    <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={color} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
