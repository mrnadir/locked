import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockScreenView } from '@/components/block-screen-view';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { MotivationalQuotes } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { useCountdown } from '@/hooks/use-countdown';
import type { RootStackScreenProps } from '@/navigation/types';

const WHITE = '#FFFFFF';

export function BlockOverlayScreen({ navigation, route }: RootStackScreenProps<'BlockOverlay'>) {
  const { appId, preview = false } = route.params;
  const { settings } = useSettings();
  const { getApp, getAppBlock, isAppBlockedNow } = useBlocker();
  const app = getApp(appId);
  const appBlock = getAppBlock(appId);
  const look = settings.blockScreen;

  const [quote] = useState(
    () => MotivationalQuotes[Math.floor(Math.random() * MotivationalQuotes.length)]
  );

  const remaining = useCountdown(appBlock?.until ?? null);
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

      <BlockScreenView
        app={app}
        look={look}
        statusLabel={statusLabel}
        remainingMs={appBlock?.until ? remaining : null}
        quote={quote}>
        <Button title="Close app" color={WHITE} textColor={look.accentColor} icon="close" onPress={close} />
      </BlockScreenView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  white: { color: WHITE },
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
});
