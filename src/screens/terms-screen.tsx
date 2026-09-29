import { LegalDocument } from '@/components/legal-document';
import { TermsOfService } from '@/constants/content';

export function TermsScreen() {
  return <LegalDocument content={TermsOfService} />;
}
