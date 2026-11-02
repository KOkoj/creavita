'use client';

import { useMemo, useState } from 'react';
import SiteFrame from '@/components/chrome/SiteFrame';
import ShotGrid from './Lightbox';
import { copy } from '@/lib/copy';
import { galleryShots, projects } from '@/data/projects';

export default function GalleryView() {
  const [filter, setFilter] = useState<string | null>(null);
  const items = useMemo(
    () =>
      galleryShots
        .filter((shot) => !filter || shot.slug === filter)
        .map((shot) => ({
          src: shot.src,
          alt: shot.alt,
          width: shot.width,
          height: shot.height,
          title: shot.title,
          descriptor: shot.descriptor,
          href: shot.href,
        })),
    [filter]
  );

  return (
    <SiteFrame variant="page" current="gallery" path="/galerie/" backHref="/">
      <section className="gallery-page case-gallery" aria-labelledby="gallery-title">
        <h1 className="case-text-title" id="gallery-title">
          {copy.gallery}
        </h1>
        <div className="gallery-filters mono" role="group" aria-label={copy.filterByProject}>
          <button
            type="button"
            className={filter === null ? 'on' : undefined}
            aria-pressed={filter === null}
            onClick={() => setFilter(null)}
          >
            {copy.filterAll} ({galleryShots.length})
          </button>
          {projects.map((p) => {
            const n = galleryShots.filter((s) => s.slug === p.slug).length;
            return (
              <button
                key={p.slug}
                type="button"
                className={filter === p.slug ? 'on' : undefined}
                aria-pressed={filter === p.slug}
                onClick={() => setFilter(p.slug)}
              >
                {p.client} ({n})
              </button>
            );
          })}
        </div>
        <ShotGrid items={items} bento />
      </section>
    </SiteFrame>
  );
}
