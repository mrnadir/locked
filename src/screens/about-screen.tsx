import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { AboutUs } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';

function SectionLabel({ children }: { children: string }) {
  return (
    <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
      {children.toUpperCase()}
    </AppText>
  );
}

function InfoItem({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.item}>
      <View style={[styles.itemIcon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.itemText}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" color="textSecondary">
          {description}
        </AppText>
      </View>
    </View>
  );
}

export function AboutScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Ionicons name="lock-closed" size={40} color={colors.white} />
        </View>
        <AppText variant="title">{AppConfig.name}</AppText>
        <AppText color="textSecondary">{AppConfig.tagline}</AppText>
      </View>

      <View style={styles.group}>
        <SectionLabel>Our mission</SectionLabel>
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <AppText style={styles.paragraph}>{AboutUs.mission}</AppText>
        </Card>
      </View>

      <View style={styles.group}>
        <SectionLabel>Our story</SectionLabel>
        <Card>
          <AppText color="textSecondary" style={styles.paragraph}>
            {AboutUs.story}
          </AppText>
        </Card>
      </View>

      <View style={styles.group}>
        <SectionLabel>What we offer</SectionLabel>
        <Card style={styles.list}>
          {AboutUs.features.map((f) => (
            <InfoItem key={f.title} {...f} />
          ))}
        </Card>
      </View>

      <View style={styles.group}>
        <SectionLabel>Our values</SectionLabel>
        <Card style={styles.list}>
          {AboutUs.values.map((v) => (
            <InfoItem key={v.title} {...v} />
          ))}
        </Card>
      </View>

      <View style={styles.group}>
        <SectionLabel>Who we are</SectionLabel>
        <Card style={styles.list}>
          <InfoItem icon="business" title={AboutUs.company} description={AboutUs.companyDescription} />
        </Card>
      </View>

      <AppText variant="caption" color="textMuted" align="center">
        Made with care by {AboutUs.company}
        {'\n'}© {new Date().getFullYear()} {AboutUs.company}. All rights reserved.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.xl },
  header: { alignItems: 'center', gap: Spacing.xs },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  group: { gap: Spacing.sm },
  sectionLabel: { marginLeft: Spacing.xs, letterSpacing: 0.8 },
  paragraph: { fontSize: 15, lineHeight: 22 },
  list: { gap: Spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemIcon: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, gap: 2 },
});
