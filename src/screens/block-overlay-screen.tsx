import { AppConfig } from '@config';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockScreenView } from '@/components/block-screen-view';
import { PIN_LENGTH, PinPad } from '@/components/pin-pad';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { MotivationalQuotes } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { useCountdown } from '@/hooks/use-countdown';
import type { RootStackScreenProps } from '@/navigation/types';
import { formatMinutes } from '@/utils/format';

type Phase = 'blocked' | 'waiting' | 'pin' | 'choose';

const WHITE = '#FFFFFF';
const WHITE_SOFT = 'rgba(255,255,255,0.18)';

export function BlockOverlayScreen({ navigation, route }: RootStackScreenProps<'BlockOverlay'>) {
  const { appId, preview = false } = route.params;
  const { settings } = useSettings();
  const { getApp, getAppBlock, isAppBlockedNow, unlockApp, unlocksUsedToday } = useBlocker();
  const app = getApp(appId);
  const appBlock = getAppBlock(appId);
  const look = settings.blockScreen;

  const [phase, setPhase] = useState<Phase>('blocked');
  const [waitUntil, setWaitUntil] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [quote] = useState(
    () => MotivationalQuotes[Math.floor(Math.random() * MotivationalQuotes.length)]
  );

  const remaining = useCountdown(appBlock?.until ?? null);
  const waitRemaining = useCountdown(waitUntil);
  const closedRef = useRef(false);

  const close = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (navigation.canGoBack()) navigation.goBack();
  };

  const stillBlocked = isAppBlockedNow(appId);
  useEffect(() => {
    if (!preview && !stillBlocked) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, stillBlocked]);

  if (!app) return null;

  const currentPhase: Phase =
    phase === 'waiting' && waitUntil !== null && waitRemaining === 0 ? 'choose' : phase;

  const onPinChange = (next: string) => {
    if (pinError) return;
    setPin(next);
    if (next.length < PIN_LENGTH) return;
    if (next === settings.pin) {
      setPhase('choose');
      return;
    }
    setPinError(true);
    setTimeout(() => {
      setPin('');
      setPinError(false);
    }, 600);
  };

  const unlocksLeft = Math.max(0, settings.maxUnlocksPerDay - unlocksUsedToday);
  const unlockBlockedReason = settings.strictMode
    ? 'Strict mode is on. Unlocking is disabled.'
    : unlocksLeft === 0
      ? 'You have used all your unlocks for today.'
      : null;

  const startUnlock = () => {
    if (settings.unlockMethod === 'timer') {
      setWaitUntil(Date.now() + settings.unlockWaitSeconds * 1000);
      setPhase('waiting');
    } else if (settings.unlockMethod === 'pin' && settings.pin) {
      setPin('');
      setPhase('pin');
    } else {
      setPhase('choose');
    }
  };

  const confirmUnlock = (minutes: number) => {
    if (!preview) unlockApp(appId, minutes);
    close();
  };

  const statusLabel = appBlock
    ? appBlock.until
      ? `${appBlock.label} · unlocks in`
      : appBlock.label
    : 'Preview · this app is not blocked right now';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: look.accentColor }]}>
      {preview && (
        <View style={styles.previewPill}>
          <AppText variant="caption" style={styles.white}>
            PREVIEW
          </AppText>
        </View>
      )}

      {currentPhase === 'pin' ? (
        <View style={styles.pinWrap}>
          <AppText variant="title" align="center" style={styles.white}>
            Enter your PIN
          </AppText>
          <AppText align="center" style={styles.whiteSoft}>
            {pinError ? 'Wrong PIN, try again' : `to unlock ${app.name}`}
          </AppText>
          <PinPad value={pin} onChange={onPinChange} error={pinError} tint={WHITE} />
          <Button title="Cancel" variant="ghost" textColor={WHITE} onPress={() => setPhase('blocked')} />
        </View>
      ) : (
        <BlockScreenView
          app={app}
          look={look}
          statusLabel={statusLabel}
          remainingMs={appBlock?.until ? remaining : null}
          quote={quote}>
          {currentPhase === 'blocked' && (
            <>
              <Button title="Close app" color={WHITE} textColor={look.accentColor} icon="close" onPress={close} />
              {unlockBlockedReason ? (
                <AppText variant="caption" align="center" style={styles.whiteSoft}>
                  {unlockBlockedReason}
                </AppText>
              ) : (
                <Button
                  title={`Unlock for a few minutes · ${unlocksLeft} left`}
                  variant="ghost"
                  textColor={WHITE}
                  icon="lock-open-outline"
                  onPress={startUnlock}
                />
              )}
            </>
          )}

          {currentPhase === 'waiting' && (
            <View style={styles.panel}>
              <AppText variant="label" align="center" style={styles.white}>
                Take a breath. Do you really need {app.name} right now?
              </AppText>
              <AppText variant="title" align="center" style={styles.white}>
                {Math.ceil(waitRemaining / 1000)}s
              </AppText>
              <Button title="Never mind, close it" color={WHITE} textColor={look.accentColor} onPress={close} />
            </View>
          )}

          {currentPhase === 'choose' && (
            <View style={styles.panel}>
              <AppText variant="label" align="center" style={styles.white}>
                Unlock {app.name} for
              </AppText>
              <View style={styles.durations}>
                {AppConfig.unlockDurationsMinutes.map((m) => (
                  <Button
                    key={m}
                    title={formatMinutes(m)}
                    size="md"
                    color={WHITE_SOFT}
                    textColor={WHITE}
                    onPress={() => confirmUnlock(m)}
                    style={styles.durationButton}
                  />
                ))}
              </View>
              <Button title="Stay focused" color={WHITE} textColor={look.accentColor} onPress={close} />
            </View>
          )}
        </BlockScreenView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  white: { color: WHITE },
  whiteSoft: { color: 'rgba(255,255,255,0.75)' },
  previewPill: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    zIndex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pinWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  panel: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  durations: { flexDirection: 'row', gap: Spacing.sm },
  durationButton: { flex: 1 },
});
