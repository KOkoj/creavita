import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CREAVITA — úvodní stránka',
  description:
    'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
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
    description:
      'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
  },
};
