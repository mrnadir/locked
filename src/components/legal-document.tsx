import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import type { LegalDocumentContent } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LegalDocument({ content }: { content: LegalDocumentContent }) {
  const { colors } = useTheme();

  return (
    <Screen scroll edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={content.icon} size={28} color={colors.primary} />
        </View>
        <AppText variant="heading">{content.title}</AppText>
        <AppText variant="caption" color="textMuted">
          Last updated {content.lastUpdated}
        </AppText>
      </View>

      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
        <AppText style={styles.paragraph}>{content.summary}</AppText>
      </Card>

      {content.sections.map((section, index) => (
        <View key={section.title} style={styles.section}>
          <AppText variant="label">
            {index + 1}. {section.title}
          </AppText>
          <AppText color="textSecondary" style={styles.paragraph}>
            {section.body}
          </AppText>
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bullet}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <AppText color="textSecondary" style={[styles.paragraph, styles.bulletText]}>
                {bullet}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.xl },
  header: { alignItems: 'center', gap: Spacing.xs },
  icon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  section: { gap: Spacing.sm },
  paragraph: { fontSize: 15, lineHeight: 22 },
  bullet: { flexDirection: 'row', gap: Spacing.sm, paddingLeft: Spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletText: { flex: 1 },
});
