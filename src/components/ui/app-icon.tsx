import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import type { InstalledApp } from '@/constants/types';

interface AppIconProps {
  app: Pick<InstalledApp, 'icon' | 'color'>;
  size?: number;
}

export function AppIcon({ app, size = 44 }: AppIconProps) {
  return (
    <View
      style={[
        styles.icon,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: app.color },
      ]}>
      <Ionicons name={app.icon} size={size * 0.55} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center' },
});
