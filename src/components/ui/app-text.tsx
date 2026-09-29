import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSize, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: keyof ThemeColors;
  align?: 'left' | 'center' | 'right';
}

export function AppText({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[styles[variant], { color: colors[color] }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontSize: FontSize.display, fontWeight: '800', letterSpacing: -1 },
  title: { fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  heading: { fontSize: FontSize.lg, fontWeight: '700' },
  body: { fontSize: FontSize.md, lineHeight: 22 },
  label: { fontSize: FontSize.sm, fontWeight: '600' },
  caption: { fontSize: FontSize.xs, lineHeight: 16 },
});
