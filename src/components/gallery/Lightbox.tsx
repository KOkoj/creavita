'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { copy } from '@/lib/copy';

export type LightboxItem = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  title?: string;
  descriptor?: string;
  href?: string;
  tag?: string;
};

export default function ShotGrid({
  items,
  bento = false,
}: {
  items: LightboxItem[];
  bento?: boolean;
}) {
  const [i, setI] = useState<number | null>(null);
  const close = useCallback(() => setI(null), []);
  const step = useCallback(
    (dir: number) => setI((cur) => (cur === null ? cur : (cur + dir + items.length) % items.length)),
    [items.length]
  );
  const start = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    if (i !== null && i >= items.length) setI(null);
  }, [i, items.length]);

  useEffect(() => {
    if (i === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('is-fab-off');
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('is-fab-off');
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [i, close, step]);

  const shot = i === null ? null : items[i];

  return (
    <>
      <ul className={bento ? 'case-gallery-grid is-bento' : 'case-gallery-grid'}>
        {items.map((item, idx) => {
          const ratio = item.width && item.height ? item.width / item.height : 1;
          const span =
            bento &&
            (ratio < 0.8 ? 'is-tall' : idx % 6 === 0 ? 'is-big' : ratio > 1.6 && idx % 3 !== 2 ? 'is-wide' : '');
          return (
            <li key={`${item.src}-${idx}`} className={span || undefined}>
              <button type="button" className="case-gallery-item" onClick={() => setI(idx)}>
                <img
                  alt={item.alt}
                  src={item.src}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </button>
              {item.tag ? <span className="gallery-tag">{item.tag}</span> : null}
            </li>
          );
        })}
      </ul>
      {shot ? (
        <div
          className="case-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={shot.alt}
          onClick={close}
        >
          <figure className="case-lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <div
              className="case-lightbox-stage"
              onTouchStart={(e) => {
                const t = e.touches[0];
                start.current = { x: t.clientX, y: t.clientY, horizontal: null };
              }}
              onTouchMove={(e) => {
                const s = start.current;
                if (!s) return;
                const t = e.touches[0];
                const dx = t.clientX - s.x;
                const dy = t.clientY - s.y;
                if (s.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                  s.horizontal = Math.abs(dx) > Math.abs(dy);
                }
                if (s.horizontal) setDragX(0.35 * dx);
              }}
              onTouchEnd={(e) => {
                const s = start.current;
                start.current = null;
                setDragX(0);
                if (!s || !s.horizontal) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - s.x;
                const dy = t.clientY - s.y;
                if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
              }}
              onTouchCancel={() => {
                start.current = null;
                setDragX(0);
              }}
            >
              <img
                alt={shot.alt}
                src={shot.src}
                width={shot.width}
                height={shot.height}
                draggable={false}
                style={dragX ? { transform: `translateX(${dragX}px)`, transition: 'none' } : undefined}
              />
            </div>
            <figcaption className={shot.title ? 'case-lightbox-info' : 'case-lightbox-info is-bare'}>
              {shot.title ? (
                <span className="case-lightbox-meta">
                  <strong>{shot.title}</strong>
                  {shot.descriptor ? <span>{shot.descriptor}</span> : null}
                </span>
              ) : null}
              {items.length > 1 ? (
                <span className="case-lightbox-nav">
                  <button
                    type="button"
                    className="case-lightbox-prev"
                    onClick={() => step(-1)}
                    aria-label={copy.lightboxPrev}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 12H5M11 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <span className="case-lightbox-count" aria-live="polite">
                    {(i ?? 0) + 1} / {items.length}
                  </span>
                  <button
                    type="button"
                    className="case-lightbox-next"
                    onClick={() => step(1)}
                    aria-label={copy.lightboxNext}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </span>
              ) : null}
              {shot.href ? (
                <Link className="case-lightbox-btn" href={shot.href}>
                  {copy.viewProject} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </figcaption>
          </figure>
          <button
            type="button"
            className="case-lightbox-close"
            onClick={close}
            aria-label={copy.lightboxClose}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
