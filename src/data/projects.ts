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
  images: { src: string; alt: string; width: number; height: number }[];
};

/**
 * Copy is taken from the live Creavita site (creavita.cz) and PR #1 —
 * no new claims. Photos are the production project shots used there.
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
        width: 1024,
        height: 645,
      },
      {
        src: '/gallery/skoda-totemy.webp',
        alt: 'Stohovatelný kostkový totem Škoda Auto pro interní akce',
        width: 1024,
        height: 1024,
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
        width: 1024,
        height: 1024,
      },
      {
        src: '/gallery/vodafone-display.webp',
        alt: 'Pultový display Vodafone na telefony a předplacené karty',
        width: 1024,
        height: 1024,
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
        width: 1024,
        height: 1024,
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
        width: 1024,
        height: 1024,
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
        width: 1024,
        height: 1024,
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
        width: 1024,
        height: 1024,
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
        width: 1024,
        height: 1024,
      },
    ],
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
  email: 'info@creavita.cz',
};

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function projectHref(slug: string) {
  return `/projekty/${slug}/`;
}

export function adjacentProjects(slug: string) {
  const i = projects.findIndex((project) => project.slug === slug);
  if (i < 0) return { prev: undefined, next: undefined };
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

export const galleryShots = projects.flatMap((project) =>
  project.images.map((image, index) => ({
    ...image,
    slug: project.slug,
    title: project.client,
    descriptor: project.type,
    href: projectHref(project.slug),
    key: `${project.slug}-${index}`,
  }))
);
