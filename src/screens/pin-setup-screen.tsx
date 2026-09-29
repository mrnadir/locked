import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PIN_LENGTH, PinPad } from '@/components/pin-pad';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import type { RootStackScreenProps } from '@/navigation/types';

export function PinSetupScreen({ navigation }: RootStackScreenProps<'PinSetup'>) {
  const { updateSettings } = useSettings();
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const onChange = (next: string) => {
    if (error) return;
    setValue(next);
    if (next.length < PIN_LENGTH) return;

    if (firstPin === null) {
      setTimeout(() => {
        setFirstPin(next);
        setValue('');
      }, 150);
      return;
    }

    if (next === firstPin) {
      updateSettings({ pin: next, unlockMethod: 'pin' });
      navigation.goBack();
      return;
    }

    setError(true);
    setTimeout(() => {
      setError(false);
      setValue('');
      setFirstPin(null);
    }, 800);
  };

  return (
    <Screen edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.texts}>
        <AppText variant="title" align="center">
          {firstPin === null ? 'Create a PIN' : 'Confirm your PIN'}
        </AppText>
        <AppText color={error ? 'danger' : 'textSecondary'} align="center">
          {error
            ? 'PINs did not match. Start again.'
            : firstPin === null
              ? `Choose a ${PIN_LENGTH}-digit PIN to unlock blocked apps.`
              : 'Enter the same PIN again.'}
        </AppText>
      </View>
      <PinPad value={value} onChange={onChange} error={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', justifyContent: 'center', gap: Spacing.xxl },
  texts: { gap: Spacing.sm, paddingHorizontal: Spacing.lg },
});
