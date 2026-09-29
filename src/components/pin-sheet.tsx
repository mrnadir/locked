import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PIN_LENGTH, PinPad } from '@/components/pin-pad';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PinSheetProps {
  visible: boolean;
  expectedPin: string | null;
  hint: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PinSheet({ visible, expectedPin, hint, onClose, onSuccess }: PinSheetProps) {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const close = () => {
    setPin('');
    setError(false);
    onClose();
  };

  const onChange = (next: string) => {
    if (error) return;
    setPin(next);
    if (next.length < PIN_LENGTH) return;
    if (next === expectedPin) {
      setPin('');
      onSuccess();
      return;
    }
    setError(true);
    setTimeout(() => {
      setPin('');
      setError(false);
    }, 600);
  };

  return (
    <BottomSheet visible={visible} onClose={close}>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="lock-open" size={26} color={colors.primary} />
        </View>
        <View style={styles.texts}>
          <AppText variant="title" align="center">
            Enter PIN
          </AppText>
          <AppText align="center" color={error ? 'danger' : 'textSecondary'}>
            {error ? 'Wrong PIN' : hint}
          </AppText>
        </View>
        <PinPad value={pin} onChange={onChange} error={error} />
        <Button title="Cancel" variant="ghost" onPress={close} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: Spacing.lg },
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  texts: { gap: Spacing.xs },
});
