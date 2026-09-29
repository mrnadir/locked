import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as NativeSplash from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Palette, Spacing } from '@/constants/theme';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import type { RootStackScreenProps } from '@/navigation/types';

export function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const { hydrated: settingsReady, onboardingDone } = useSettings();
  const { hydrated: blockerReady } = useBlocker();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const [scale] = useState(() => new Animated.Value(0.6));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    NativeSplash.hideAsync();
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    const id = setTimeout(() => setMinTimeElapsed(true), AppConfig.splashMinDurationMs);
    return () => clearTimeout(id);
  }, [opacity, scale]);

  useEffect(() => {
    if (settingsReady && blockerReady && minTimeElapsed) {
      navigation.reset({ index: 0, routes: [{ name: onboardingDone ? 'Main' : 'Onboarding' }] });
    }
  }, [settingsReady, blockerReady, minTimeElapsed, onboardingDone, navigation]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logo}>
          <Ionicons name="lock-closed" size={52} color={Palette.primary} />
        </View>
        <AppText variant="display" style={styles.white}>
          {AppConfig.name}
        </AppText>
        <AppText style={styles.tagline}>{AppConfig.tagline}</AppText>
      </Animated.View>
      <ActivityIndicator color={Palette.white} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: Spacing.md },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  white: { color: Palette.white },
  tagline: { color: 'rgba(255,255,255,0.8)' },
  loader: { position: 'absolute', bottom: 80 },
});
