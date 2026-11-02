export type GalleryItem = {
  slug: string;
  src: string;
  alt: string;
  title: string;
  href: string;
  client: string;
  type: string;
  category: string;
  chapterId: string;
};

export type GalleryChapter = {
  id: string;
  kicker: string;
  title: string;
  body: string;
};

export type Project = {
  slug: string;
  client: string;
  title: string;
  type: string;
  category: string;
  year?: string;
  services: string[];
  intro: string;
  sections: { label: string; body: string }[];
  images: { src: string; alt: string }[];
};

/**
 * Copy is taken from the live Creavita site (creavita.cz) and the existing
 * GitHub pages — no new claims. Photos are the production project shots
 * used on that homepage (roll-upy, totemy, stojany, displeje, promo stánek).
 */
export const projects: Project[] = [
  {
    slug: 'skoda-auto-rollupy-totemy',
    client: 'ŠKODA AUTO',
    title: 'Škoda Auto — roll-upy a totemy',
    type: 'Roll-upy, totemy',
    category: 'Design a výroba',
    services: ['grafický design', 'příprava pro tisk', 'výroba'],
    intro:
      'Škoda Auto — roll-upy a totemy. Design a výroba. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
    sections: [
      {
        label: 'Design a výroba',
        body: 'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
      },
    ],
    images: [
      {
        src: '/gallery/skoda-rollupy.webp',
        alt: 'Roll-up bannery Škoda Auto pro program human touch',
      },
      {
        src: '/gallery/skoda-totemy.webp',
        alt: 'Stohovatelný kostkový totem Škoda Auto pro interní akce',
      },
    ],
  },
  {
    slug: 'vodafone-stojany',
    client: 'VODAFONE',
    title: 'Vodafone — stojany do prodejen',
    type: 'Stojany, POS',
    category: 'Design a výroba',
    services: [
      'konstrukční návrh',
      'grafický design',
      'příprava pro výrobu',
      'výroba',
    ],
    intro:
      'Vodafone — stojany a POS. Design a výroba. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
    sections: [
      {
        label: 'Design a výroba',
        body: 'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
      },
    ],
    images: [
      {
        src: '/gallery/vodafone-stojan.webp',
        alt: 'Podlahový stojan na letáky Vodafone v prodejně',
      },
      {
        src: '/gallery/vodafone-display.webp',
        alt: 'Pultový display Vodafone na telefony a předplacené karty',
      },
    ],
  },
  {
    slug: 'adidas-pure-energy-stojan',
    client: 'ADIDAS',
    title: 'adidas — stojan Pure Energy',
    type: 'Stojan, POS',
    category: 'Design a výroba',
    services: ['konstrukční návrh', 'grafický design', 'výroba'],
    intro:
      'adidas — stojan, POS. Design a výroba. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
    sections: [
      {
        label: 'Design a výroba',
        body: 'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
      },
    ],
    images: [
      {
        src: '/gallery/adidas-stojan.webp',
        alt: 'Podlahový stojan adidas Pure Energy Limited Edition v prodejně',
      },
    ],
  },
  {
    slug: 'philips-smart-tv-stanek',
    client: 'PHILIPS',
    title: 'Philips — promo stánek Smart TV',
    type: 'Promo stánek',
    category: 'Design a výroba',
    services: ['konstrukční návrh', 'grafický design', 'výroba', 'instalace'],
    intro:
      'Philips — promo stánek. Design a výroba. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
    sections: [
      {
        label: 'Design a výroba',
        body: 'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
      },
    ],
    images: [
      {
        src: '/gallery/philips-stanek.webp',
        alt: 'Promo stánek Philips Smart TV s Ambilight v obchodním centru',
      },
    ],
  },
  {
    slug: 'stella-artois-stojan',
    client: 'STELLA ARTOIS',
    title: 'Stella Artois — prodejní stojan',
    type: 'Stojan, POS',
    category: 'Design a výroba',
    services: ['konstrukční návrh', 'grafický design', 'výroba'],
    intro:
      'Stella Artois — stojan, POS. Design a výroba. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
    sections: [
      {
        label: 'Design a výroba',
        body: 'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
      },
    ],
    images: [
      {
        src: '/gallery/stella-stojan.webp',
        alt: 'Zlatý podlahový stojan Stella Artois na lahvové pivo',
      },
    ],
  },
  {
    slug: 'fiskars-stojan',
    client: 'FISKARS',
    title: 'Fiskars — prodejní stojan',
    type: 'Stojan, POS',
    category: 'Design a výroba',
    services: ['konstrukční návrh', 'grafický design', 'výroba'],
    intro:
      'Fiskars — stojan, POS. Design a výroba. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
    sections: [
      {
        label: 'Design a výroba',
        body: 'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
      },
    ],
    images: [
      {
        src: '/gallery/fiskars-stojan.webp',
        alt: 'Podlahový stojan Fiskars na sekery a zahradní nůžky v hobbymarketu',
      },
    ],
  },
  {
    slug: 'globus-etikety',
    client: 'GLOBUS',
    title: 'Globus — etikety Od nás',
    type: 'Etikety',
    category: 'Design obalů',
    services: ['grafický design', 'příprava pro tisk'],
    intro:
      'Globus — etikety. Design obalů. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
    sections: [
      {
        label: 'Design obalů',
        body: 'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
      },
    ],
    images: [
      {
        src: '/gallery/globus-etikety.webp',
        alt: 'Etiketa Globus Od nás na balení salátu s sebou',
      },
    ],
  },
];

export const galleryItems: GalleryItem[] = [
  {
    slug: 'skoda-auto-rollupy-totemy',
    src: '/gallery/skoda-rollupy.webp',
    alt: 'Roll-up bannery Škoda Auto pro program human touch',
    title: 'Škoda Auto — roll-upy',
    href: '/projekty/skoda-auto-rollupy-totemy/',
    client: 'ŠKODA AUTO',
    type: 'Roll-upy, totemy',
    category: 'Design a výroba',
    chapterId: 'rollupy',
  },
  {
    slug: 'skoda-auto-rollupy-totemy',
    src: '/gallery/skoda-totemy.webp',
    alt: 'Stohovatelný kostkový totem Škoda Auto pro interní akce',
    title: 'Škoda Auto — totemy',
    href: '/projekty/skoda-auto-rollupy-totemy/',
    client: 'ŠKODA AUTO',
    type: 'Roll-upy, totemy',
    category: 'Design a výroba',
    chapterId: 'rollupy',
  },
  {
    slug: 'vodafone-stojany',
    src: '/gallery/vodafone-stojan.webp',
    alt: 'Podlahový stojan na letáky Vodafone v prodejně',
    title: 'Vodafone — podlahový stojan',
    href: '/projekty/vodafone-stojany/',
    client: 'VODAFONE',
    type: 'Stojany, POS',
    category: 'Design a výroba',
    chapterId: 'stojany',
  },
  {
    slug: 'vodafone-stojany',
    src: '/gallery/vodafone-display.webp',
    alt: 'Pultový display Vodafone na telefony a předplacené karty',
    title: 'Vodafone — pultový display',
    href: '/projekty/vodafone-stojany/',
    client: 'VODAFONE',
    type: 'Stojany, POS',
    category: 'Design a výroba',
    chapterId: 'stojany',
  },
  {
    slug: 'adidas-pure-energy-stojan',
    src: '/gallery/adidas-stojan.webp',
    alt: 'Podlahový stojan adidas Pure Energy Limited Edition v prodejně',
    title: 'adidas — stojan Pure Energy',
    href: '/projekty/adidas-pure-energy-stojan/',
    client: 'ADIDAS',
    type: 'Stojan, POS',
    category: 'Design a výroba',
    chapterId: 'stojany',
  },
  {
    slug: 'philips-smart-tv-stanek',
    src: '/gallery/philips-stanek.webp',
    alt: 'Promo stánek Philips Smart TV s Ambilight v obchodním centru',
    title: 'Philips — promo stánek Smart TV',
    href: '/projekty/philips-smart-tv-stanek/',
    client: 'PHILIPS',
    type: 'Promo stánek',
    category: 'Design a výroba',
    chapterId: 'promo',
  },
  {
    slug: 'stella-artois-stojan',
    src: '/gallery/stella-stojan.webp',
    alt: 'Zlatý podlahový stojan Stella Artois na lahvové pivo',
    title: 'Stella Artois — prodejní stojan',
    href: '/projekty/stella-artois-stojan/',
    client: 'STELLA ARTOIS',
    type: 'Stojan, POS',
    category: 'Design a výroba',
    chapterId: 'pos',
  },
  {
    slug: 'fiskars-stojan',
    src: '/gallery/fiskars-stojan.webp',
    alt: 'Podlahový stojan Fiskars na sekery a zahradní nůžky v hobbymarketu',
    title: 'Fiskars — prodejní stojan',
    href: '/projekty/fiskars-stojan/',
    client: 'FISKARS',
    type: 'Stojan, POS',
    category: 'Design a výroba',
    chapterId: 'pos',
  },
  {
    slug: 'globus-etikety',
    src: '/gallery/globus-etikety.webp',
    alt: 'Etiketa Globus Od nás na balení salátu s sebou',
    title: 'Globus — etikety Od nás',
    href: '/projekty/globus-etikety/',
    client: 'GLOBUS',
    type: 'Etikety',
    category: 'Design obalů',
    chapterId: 'identita',
  },
];

export const galleryChapters: GalleryChapter[] = [
  {
    id: 'rollupy',
    kicker: 'Design a výroba',
    title: 'Roll-upy a totemy',
    body: 'Škoda Auto — roll-upy a totemy. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
  },
  {
    id: 'stojany',
    kicker: 'Design a výroba',
    title: 'Stojany a POS',
    body: 'Vodafone, adidas — stojany a POS. Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
  },
  {
    id: 'promo',
    kicker: 'Design a výroba',
    title: 'Promo stánek',
    body: 'Philips — promo stánek. Design a výroba. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia.',
  },
  {
    id: 'pos',
    kicker: 'Design a výroba',
    title: 'Stojan, POS',
    body: 'Stella Artois, Fiskars — stojany, POS. Výběr klientů a projektů, se kterými jsme spolupracovali.',
  },
  {
    id: 'identita',
    kicker: 'Design obalů',
    title: 'Etikety',
    body: 'Globus — etikety. Design obalů. Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia.',
  },
];

export const studioCopy = {
  intro:
    'Studio formují lidé, kterým hluboce záleží na designu i procesu, který za ním stojí.',
  lead: 'Výběr klientů a projektů, se kterými jsme spolupracovali.',
  about:
    'Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
  process:
    'Každý projekt se stává případovou studií a smysluplnou součástí našeho portfolia, na níž pracujeme s péčí a důkladností.',
  contactIntro:
    'Máte dotaz, nebo zájem o spolupráci? Neváhejte nás kontaktovat.',
};

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function chapterForProgress(progress: number): GalleryChapter {
  const clamped = Math.min(0.999, Math.max(0, progress));
  const index = Math.min(
    galleryItems.length - 1,
    Math.floor(clamped * galleryItems.length)
  );
  const chapterId = galleryItems[index]?.chapterId ?? galleryChapters[0].id;
  return (
    galleryChapters.find((chapter) => chapter.id === chapterId) ??
    galleryChapters[0]
  );
}
