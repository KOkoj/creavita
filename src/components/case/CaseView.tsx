'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SiteFrame from '@/components/chrome/SiteFrame';
import ShotGrid from '@/components/gallery/Lightbox';
import { adjacentProjects, getProject, projectHref, type Project } from '@/data/projects';
import { copy } from '@/lib/copy';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

function ParallaxShot({
  image,
  className,
  priority = false,
  sizes = '100vw',
}: {
  image: Project['images'][number];
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const root = wrap.current;
    const el = img.current;
    if (!root || !el || prefersReducedMotion()) return;
    const tween = gsap.fromTo(
      el,
      { yPercent: priority ? -4 : -8, scale: priority ? 1.12 : 1.14 },
      {
        yPercent: priority ? 4 : 8,
        scale: 1.08,
        ease: 'none',
        immediateRender: true,
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [priority]);

  return (
    <div className={className} ref={wrap}>
      <img
        ref={img}
        alt={image.alt}
        src={image.src}
        width={image.width}
        height={image.height}
        sizes={sizes}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </div>
  );
}

export default function CaseView({ slug }: { slug: string }) {
  const project = getProject(slug);
  if (!project) return null;
  const { next } = adjacentProjects(slug);
  const [hero, ...rest] = project.images;
  const pair = rest.length >= 2 ? rest.slice(0, 2) : null;
  const leftovers = pair ? rest.slice(2) : rest;

  return (
    <SiteFrame
      variant="case"
      current="work"
      path={projectHref(slug)}
      backHref="/#prace"
      nextHref={next ? projectHref(next.slug) : undefined}
      nextLabel={copy.nextProject}
    >
      <article className="case-page">
        <header className="case-hero">
          {hero ? (
            <ParallaxShot image={hero} className="case-frame" priority sizes="100vw" />
          ) : null}
          <div className="case-hero-copy">
            <p className="case-hero-facts">
              <span>{project.type}</span>
              <span>{project.category}</span>
            </p>
            <div className="case-hero-end">
              <h1>{project.client}</h1>
              <p>{project.intro}</p>
            </div>
          </div>
        </header>
        <div className="case-flow">
          <section className="case-block is-statement is-200">
            <p className="case-statement">{project.sections[0]?.body ?? project.intro}</p>
          </section>
          {project.sections.map((section, i) => (
            <section className="case-block is-text is-200" key={`${section.label}-${i}`}>
              <h2 className="case-text-title">{section.label}</h2>
              <p className="case-text-body">{section.body}</p>
            </section>
          ))}
          {pair ? (
            <section className="case-block is-pair is-64">
              <ParallaxShot
                image={pair[0]}
                className="case-shot is-left"
                sizes="(max-width: 800px) 100vw, 60vw"
              />
              <ParallaxShot
                image={pair[1]}
                className="case-shot is-right"
                sizes="(max-width: 800px) 100vw, 60vw"
              />
            </section>
          ) : leftovers[0] ? (
            <section className="case-block is-image is-64">
              <ParallaxShot
                image={leftovers[0]}
                className="case-shot is-full"
                sizes="min(1440px, 100vw)"
              />
            </section>
          ) : null}
          {pair && leftovers[0] ? (
            <section className="case-block is-image is-64">
              <ParallaxShot
                image={leftovers[0]}
                className="case-shot is-full"
                sizes="min(1440px, 100vw)"
              />
            </section>
          ) : null}
        </div>
        {project.images.length > 1 ? (
          <section className="case-gallery" aria-labelledby="case-gallery-title">
            <h2 className="case-text-title" id="case-gallery-title">
              {copy.gallery}
            </h2>
            <ShotGrid
              items={project.images.map((img) => ({
                src: img.src,
                alt: img.alt,
                width: img.width,
                height: img.height,
              }))}
            />
          </section>
        ) : null}
        {next ? (
          <section className="case-next" aria-label={copy.nextProject}>
            <a href={projectHref(next.slug)}>
              <img
                alt={next.images[0]?.alt ?? next.title}
                src={next.images[0]?.src}
                width={next.images[0]?.width}
                height={next.images[0]?.height}
                sizes="(max-width: 800px) 100vw, 42vw"
              />
              <span className="case-next-copy">
                <small>{copy.nextProject}</small>
                <strong>{next.client}</strong>
              </span>
            </a>
          </section>
        ) : null}
      </article>
    </SiteFrame>
  );
}
