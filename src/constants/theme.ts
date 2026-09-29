export const Palette = {
  primary: '#5B5BF7',
  primaryDark: '#4343D9',
  danger: '#FF4D6D',
  success: '#22C55E',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Colors = {
  light: {
    ...Palette,
    background: '#F2F2F7',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    border: '#D8D8DE',
    inputBackground: '#FFFFFF',
    inputBorder: '#C7C7CC',
    text: '#000000',
    textSecondary: '#6C6C70',
    textMuted: '#AEAEB2',
    primarySoft: '#ECECFF',
    dangerSoft: '#FFE8ED',
    successSoft: '#E4F8EC',
    warningSoft: '#FEF3DC',
    tabBar: '#FFFFFF',
  },
  dark: {
    ...Palette,
    background: '#000000',
    card: '#1C1C1E',
    cardElevated: '#2C2C2E',
    border: '#38383A',
    inputBackground: '#1C1C1E',
    inputBorder: '#48484A',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textMuted: '#636366',
    primarySoft: '#26264D',
    dangerSoft: '#3D1821',
    successSoft: '#123322',
    warningSoft: '#36290D',
    tabBar: '#121212',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 40,
} as const;

/** Accent colors the user can pick for the block screen. */
export const AccentChoices = [
  '#5B5BF7',
  '#FF4D6D',
  '#22C55E',
  '#F59E0B',
  '#06B6D4',
  '#A855F7',
  '#111827',
] as const;
