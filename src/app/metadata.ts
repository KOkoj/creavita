import { Metadata } from 'next';
import { studioCopy } from '@/data/projects';

export const metadata: Metadata = {
  title: 'CREAVITA — Studio',
  description: studioCopy.intro,
  keywords: [
    'Creavita',
    'POS',
    'stojany',
    'roll-upy',
    'totemy',
    'promo stánek',
    'grafický design',
  ],
  metadataBase: new URL('https://creavita.cz'),
  openGraph: {
    type: 'website',
    title: 'CREAVITA',
    description: studioCopy.intro,
  },
};
