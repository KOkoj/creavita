'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import GalleryFallbackGrid from '@/components/GalleryFallbackGrid';
import {
  chapterForProgress,
  galleryItems,
  type GalleryItem,
} from '@/data/projects';
import type { GalleryImageItem } from '@/components/ui/3d-gallery-photography';

const InfiniteGallery = dynamic(
  () => import('@/components/ui/3d-gallery-photography'),
  { ssr: false }
);

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return mobile;
}

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

export default function ScrollGallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [webgl, setWebgl] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      // First viewport of the section sits under the hero (negative margin).
      // Drive the 3D playhead only after the hero has fully revealed the canvas.
      const start = viewport;
      const total = section.offsetHeight - viewport - start;
      const scrolled = Math.max(0, -rect.top - start);
      const next = total <= 0 ? 0 : Math.min(1, scrolled / total);
      setProgress(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const chapter = useMemo(() => chapterForProgress(progress), [progress]);
  const useFallback = reducedMotion || !webgl;

  const onSelect = useCallback(
    (image: GalleryImageItem) => {
      if (image.href) router.push(image.href);
    },
    [router]
  );

  const onContextLost = useCallback(() => {
    setWebgl(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="scroll-gallery"
      aria-labelledby={useFallback ? undefined : 'scroll-gallery-title'}
      aria-label={useFallback ? 'Naše práce' : undefined}
    >
      <div className="scroll-gallery__sticky">
        {useFallback ? (
          <GalleryFallbackGrid items={galleryItems} title="Naše práce" />
        ) : (
          <InfiniteGallery
            images={galleryItems}
            scrollProgress={progress}
            visibleCount={isMobile ? 6 : 10}
            zSpacing={isMobile ? 2.6 : 3}
            dpr={isMobile ? 1 : [1, 1.5]}
            className="h-full w-full"
            onSelect={onSelect}
            onContextLost={onContextLost}
          />
        )}

        {!useFallback && (
          <div className="scroll-gallery__overlay" aria-live="polite">
            <p className="scroll-gallery__kicker">{chapter.kicker}</p>
            <h2 id="scroll-gallery-title" className="scroll-gallery__title">
              {chapter.title}
            </h2>
            <p className="scroll-gallery__body">{chapter.body}</p>
          </div>
        )}

        <nav className="visually-hidden" aria-label="Projekty v galerii">
          <ul>
            {uniqueByHref(galleryItems).map((item) => (
              <li key={item.href}>
                <a href={item.href}>
                  {item.client} — {item.type}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

function uniqueByHref(items: GalleryItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}
