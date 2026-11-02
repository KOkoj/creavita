import ContactView from '@/components/contact/ContactView';
import { copy } from '@/lib/copy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${copy.contact} — CREAVITA`,
  description: copy.contactLead,
};

export default function Page() {
  return <ContactView />;
}
