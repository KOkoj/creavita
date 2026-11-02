import AboutView from '@/components/about/AboutView';
import { copy } from '@/lib/copy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${copy.about} — CREAVITA`,
  description: copy.aboutBody,
};

export default function Page() {
  return <AboutView />;
}
