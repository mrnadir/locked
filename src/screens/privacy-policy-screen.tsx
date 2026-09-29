import { LegalDocument } from '@/components/legal-document';
import { PrivacyPolicy } from '@/constants/content';

export function PrivacyPolicyScreen() {
  return <LegalDocument content={PrivacyPolicy} />;
}
