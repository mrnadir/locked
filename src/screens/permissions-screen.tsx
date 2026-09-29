import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { PermissionInfo } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import type { PermissionKind } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/navigation/types';

const REQUIRED: PermissionKind[] = ['usageAccess', 'overlay'];

export function PermissionsScreen({ navigation, route }: RootStackScreenProps<'Permissions'>) {
  const fromSettings = route.params?.fromSettings ?? false;
  const { colors } = useTheme();
  const { permissions, requestPermission } = useBlocker();
  const [pending, setPending] = useState<PermissionKind | null>(null);

  const canContinue = REQUIRED.every((kind) => permissions[kind]);

  const grant = async (kind: PermissionKind) => {
    setPending(kind);
    try {
      await requestPermission(kind);
    } finally {
      setPending(null);
    }
  };

  return (
    <Screen
      scroll
      edges={fromSettings ? [] : ['top', 'bottom']}
      footer={
        !fromSettings && (
          <Button
            title="Continue"
            disabled={!canContinue}
            onPress={() => navigation.navigate('AppSelection', { fromOnboarding: true })}
          />
        )
      }>
      {!fromSettings && (
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          </View>
          <AppText variant="title" align="center">
            Allow permissions
          </AppText>
          <AppText color="textSecondary" align="center">
            Locked needs a few permissions to detect and block apps. Your data never leaves your
            device.
          </AppText>
        </View>
      )}

      {(Object.keys(PermissionInfo) as PermissionKind[]).map((kind) => {
        const info = PermissionInfo[kind];
        const granted = permissions[kind];
        return (
          <Card key={kind} style={styles.card}>
            <View style={[styles.icon, { backgroundColor: granted ? colors.successSoft : colors.primarySoft }]}>
              <Ionicons name={info.icon} size={22} color={granted ? colors.success : colors.primary} />
            </View>
            <View style={styles.texts}>
              <AppText variant="label">
                {info.title}
                {!REQUIRED.includes(kind) && (
                  <AppText variant="caption" color="textMuted">
                    {'  '}Optional
                  </AppText>
                )}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {info.description}
              </AppText>
            </View>
            {granted ? (
              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            ) : (
              <Button
                title="Allow"
                size="md"
                variant="secondary"
                loading={pending === kind}
                onPress={() => grant(kind)}
              />
            )}
          </Card>
        );
      })}

      {Platform.OS === 'ios' && (
        <AppText variant="caption" color="textMuted" align="center">
          On iOS these map to a single Screen Time authorization.
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl, paddingBottom: Spacing.sm },
  headerIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});
