import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const PIN_LENGTH = 4;

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  /** Overrides theme colors, e.g. on the colored block screen. */
  tint?: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function PinPad({ value, onChange, error, tint }: PinPadProps) {
  const { colors } = useTheme();
  const foreground = tint ?? colors.text;

  const press = (key: string) => {
    if (key === 'del') onChange(value.slice(0, -1));
    else if (value.length < PIN_LENGTH) onChange(value + key);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: error ? colors.danger : foreground },
              i < value.length && { backgroundColor: error ? colors.danger : foreground },
            ]}
          />
        ))}
      </View>
      <View style={styles.grid}>
        {KEYS.map((key, i) =>
          key === '' ? (
            <View key={i} style={styles.key} />
          ) : (
            <Pressable
              key={i}
              onPress={() => press(key)}
              style={({ pressed }) => [styles.key, pressed && { opacity: 0.5 }]}>
              {key === 'del' ? (
                <Ionicons name="backspace-outline" size={26} color={foreground} />
              ) : (
                <AppText variant="title" style={{ color: foreground }}>
                  {key}
                </AppText>
              )}
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.xl },
  dots: { flexDirection: 'row', gap: Spacing.lg },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 264, justifyContent: 'center' },
  key: { width: 88, height: 64, alignItems: 'center', justifyContent: 'center' },
});
