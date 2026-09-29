import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Wraps around past min/max instead of stopping (useful for clock values). */
  wrap?: boolean;
  format?: (value: number) => string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  wrap = false,
  format = String,
}: StepperProps) {
  const { colors } = useTheme();

  const change = (delta: number) => {
    let next = value + delta;
    if (wrap) {
      const range = max - min + step;
      next = ((((next - min) % range) + range) % range) + min;
    } else {
      next = Math.min(max, Math.max(min, next));
    }
    onChange(next);
  };

  const button = (icon: 'remove' | 'add', delta: number, disabled: boolean) => (
    <Pressable
      onPress={() => change(delta)}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primarySoft, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {button('remove', -step, !wrap && value <= min)}
      <AppText variant="heading" style={styles.value}>
        {format(value)}
      </AppText>
      {button('add', step, !wrap && value >= max)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  button: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 72, textAlign: 'center' },
});
