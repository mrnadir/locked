import { AppConfig } from '@config';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Device from 'expo-device';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { SupportFaqs } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/navigation/types';

const ContactTopics: { id: string; icon: IconName; title: string; subtitle: string; subject: string }[] = [
  {
    id: 'question',
    icon: 'chatbubble-ellipses',
    title: 'Ask a question',
    subtitle: 'Get help using Locked',
    subject: 'Question',
  },
  {
    id: 'bug',
    icon: 'bug',
    title: 'Report a problem',
    subtitle: 'Something is not working right',
    subject: 'Bug report',
  },
  {
    id: 'feature',
    icon: 'bulb',
    title: 'Suggest a feature',
    subtitle: 'Tell us what would help you focus',
    subject: 'Feature request',
  },
];

function deviceSummary() {
  const os = `${Device.osName ?? Platform.OS} ${Device.osVersion ?? ''}`.trim();
  return `App: ${AppConfig.name} ${AppConfig.version}\nDevice: ${Device.modelName ?? 'Unknown'}\nSystem: ${os}`;
}

async function openEmail(subject: string) {
  const body = `\n\n\n---\n${deviceSummary()}`;
  const url = `mailto:${AppConfig.supportEmail}?subject=${encodeURIComponent(
    `[${AppConfig.name}] ${subject}`
  )}&body=${encodeURIComponent(body)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('No email app found', `Please email us at ${AppConfig.supportEmail}`);
  }
}

export function ContactSupportScreen({ navigation }: RootStackScreenProps<'ContactSupport'>) {
  const { colors } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <Screen scroll edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="headset" size={28} color={colors.primary} />
        </View>
        <AppText variant="heading">How can we help?</AppText>
        <AppText color="textSecondary" align="center">
          We usually reply within 24–48 hours.
        </AppText>
      </View>

      <View style={styles.group}>
        <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
          CONTACT US
        </AppText>
        <ListGroup>
          {ContactTopics.map((t) => (
            <ListRow
              key={t.id}
              icon={t.icon}
              title={t.title}
              subtitle={t.subtitle}
              onPress={() => openEmail(t.subject)}
            />
          ))}
        </ListGroup>
      </View>

      <Card style={styles.emailCard}>
        <Ionicons name="mail" size={20} color={colors.primary} />
        <View style={styles.emailText}>
          <AppText variant="caption" color="textSecondary">
            Email
          </AppText>
          <AppText variant="label" selectable>
            {AppConfig.supportEmail}
          </AppText>
        </View>
      </Card>

      <View style={styles.group}>
        <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
          FREQUENTLY ASKED QUESTIONS
        </AppText>
        <ListGroup>
          {SupportFaqs.map((faq, index) => {
            const expanded = openFaq === index;
            return (
              <Pressable
                key={faq.question}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => setOpenFaq(expanded ? null : index)}
                style={[
                  styles.faq,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                ]}>
                <View style={styles.faqHeader}>
                  <AppText variant="label" style={styles.faqQuestion}>
                    {faq.question}
                  </AppText>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                </View>
                {expanded && (
                  <AppText color="textSecondary" style={styles.faqAnswer}>
                    {faq.answer}
                  </AppText>
                )}
              </Pressable>
            );
          })}
        </ListGroup>
      </View>

      <ListGroup>
        <ListRow
          icon="shield-checkmark"
          title="Privacy policy"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
      </ListGroup>
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
  group: { gap: Spacing.sm },
  sectionLabel: { marginLeft: Spacing.xs, letterSpacing: 0.8 },
  emailCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emailText: { flex: 1, gap: 2 },
  faq: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  faqQuestion: { flex: 1 },
  faqAnswer: { fontSize: 15, lineHeight: 22 },
});
