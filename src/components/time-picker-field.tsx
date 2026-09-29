import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Stepper } from '@/components/ui/stepper';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatClock } from '@/utils/format';

interface TimePickerFieldProps {
  label: string;
  /** Minutes from midnight. */
  minutes: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

function toDate(minutes: number): Date {
  const d = new Date();
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
}

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Shows a time and opens the system clock picker (dialog on Android, wheel sheet on iOS). */
export function TimePickerField({ label, minutes, onChange, disabled }: TimePickerFieldProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(minutes);
  const [progress] = useState(() => new Animated.Value(0));

  const [clock, period] = formatClock(minutes).split(' ');

  const openPicker = () => {
    setDraft(minutes);
    progress.setValue(0);
    setOpen(true);
  };

  const animateIn = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  const confirm = () => {
    onChange(draft);
    close();
  };

  const sheetTranslateY = progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] });

  return (
    <>
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        ]}>
        <View style={styles.labelRow}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <AppText variant="caption" color="textSecondary">
            {label}
          </AppText>
        </View>
        <View style={styles.timeRow}>
          <AppText variant="title">{clock}</AppText>
          <AppText variant="label" color="textSecondary">
            {period}
          </AppText>
        </View>
        <AppText variant="caption" color="primary">
          Tap to change
        </AppText>
      </Pressable>

      {open && Platform.OS === 'android' && (
        <DateTimePicker
          mode="time"
          presentation="dialog"
          value={toDate(minutes)}
          is24Hour={false}
          accentColor={colors.primary}
          onValueChange={(_, date) => {
            setOpen(false);
            onChange(toMinutes(date));
          }}
          onDismiss={() => setOpen(false)}
          style={styles.dialogHost}
        />
      )}

      {Platform.OS !== 'android' && (
        <Modal
          visible={open}
          transparent
          animationType="none"
          statusBarTranslucent
          onShow={animateIn}
          onRequestClose={close}>
          <Animated.View style={[styles.backdrop, { opacity: progress }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          </Animated.View>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + Spacing.lg,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={close} hitSlop={10}>
                <AppText variant="label" color="textSecondary">
                  Cancel
                </AppText>
              </Pressable>
              <AppText variant="heading">{label}</AppText>
              <Pressable onPress={confirm} hitSlop={10}>
                <AppText variant="label" color="primary">
                  Done
                </AppText>
              </Pressable>
            </View>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                mode="time"
                display="spinner"
                value={toDate(draft)}
                accentColor={colors.primary}
                themeVariant={isDark ? 'dark' : 'light'}
                onValueChange={(_, date) => setDraft(toMinutes(date))}
                style={styles.wheel}
              />
            ) : (
              <View style={styles.webFallback}>
                <Stepper value={draft} onChange={setDraft} min={0} max={24 * 60 - 5} step={5} wrap format={formatClock} />
              </View>
            )}
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs },
  dialogHost: { position: 'absolute', width: 1, height: 1 },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wheel: { alignSelf: 'stretch' },
  webFallback: { alignItems: 'center', paddingVertical: Spacing.xl },
});
