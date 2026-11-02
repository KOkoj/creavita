'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { copy, MAILTO } from '@/lib/copy';
import { isTouch, prefersReducedMotion } from '@/lib/motion';
import HeroShader from './HeroShader';

function Name({ nameRef }: { nameRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <h1 ref={nameRef}>
      <span className="base-probe" aria-hidden="true" />
      {copy.name}
    </h1>
  );
}

export default function HeroStage({
  stageRef,
  nameRef,
  introReady,
  onOpenContact,
}: {
  stageRef: React.RefObject<HTMLElement | null>;
  nameRef: React.RefObject<HTMLHeadingElement | null>;
  introReady: boolean;
  onOpenContact: () => void;
}) {
  const mediaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const name = nameRef.current;
    if (!stage || !name) return;
    const fit = () => {
      const mobile = window.matchMedia('(max-width: 800px)').matches;
      const cta = stage.querySelector('.hero-cta') as HTMLElement | null;
      const width = mobile
        ? name.parentElement?.clientWidth ?? stage.clientWidth
        : stage.clientWidth;
      if (!width) return;
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return;
      const family = getComputedStyle(name).fontFamily;
      ctx.font = `500 100px ${family}`;
      ctx.letterSpacing = '-0.06em';
      const metrics = ctx.measureText(copy.name);
      const textW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
      if (!textW) return;
      const ctaW = !mobile && cta ? cta.getBoundingClientRect().width : 0;
      const size = ((ctaW > 0 ? width - ctaW - 36 : width) * 98) / (textW + 3.5);
      const shift = metrics.actualBoundingBoxLeft * (size / 100);
      name.style.fontSize = `${size}px`;
      name.style.marginLeft = `${-shift}px`;
    };
    const fold = stage.closest('.fold');
    const reduced = prefersReducedMotion();
    const touch = isTouch();
    const reveal = () => {
      fit();
      if (!fold || !introReady) return;
      document.documentElement.removeAttribute('data-arrival');
      document.documentElement.removeAttribute('data-cv-intro');
      if (reduced) {
        fold.classList.add('is-open', 'is-shown', 'is-settled');
        return;
      }
      fold.classList.add('is-open');
      requestAnimationFrame(() => fold.classList.add('is-shown'));
      window.setTimeout(() => fold.classList.add('is-settled'), 1600);
    };
    const ro = new ResizeObserver(() => fit());
    ro.observe(stage);
    if (!introReady) {
      fit();
      return () => ro.disconnect();
    }
    document.fonts?.ready.then(reveal);
    const t = window.setTimeout(reveal, touch ? 400 : 120);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [stageRef, nameRef, introReady]);

  useEffect(() => {
    const media = mediaRef.current;
    const fold = stageRef.current?.closest('.fold');
    if (!media || !fold) return;
    const goLive = () => {
      media.classList.add('is-live', 'is-ready');
      if (!fold.classList.contains('is-shown')) fold.classList.add('is-shown');
    };
    const obs = new MutationObserver(() => {
      if (fold.classList.contains('is-open')) goLive();
    });
    obs.observe(fold, { attributes: true, attributeFilter: ['class'] });
    if (fold.classList.contains('is-open')) goLive();
    const sg = document.querySelector('.sg');
    let cover: IntersectionObserver | undefined;
    if (sg && !window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      cover = new IntersectionObserver(
        () => {
          const covered = sg.getBoundingClientRect().top <= 1;
          media.classList.toggle('is-covered', covered);
        },
        { rootMargin: '0px 0px -99% 0px', threshold: [0, 1] }
      );
      cover.observe(sg);
    }
    return () => {
      obs.disconnect();
      cover?.disconnect();
    };
  }, [stageRef]);

  return (
    <section className="hero-stage" ref={stageRef} aria-label={copy.name}>
      <div className="hero-media" ref={mediaRef}>
        <HeroShader />
      </div>
      <div className="hero-bottom">
        <div className="labels mono">
          <span className="tag">{copy.portfolio}</span>
          <span className="tag">{copy.year}</span>
        </div>
        <div className="hero-name">
          <Name nameRef={nameRef} />
        </div>
        <button
          type="button"
          className="hero-cta"
          aria-label={copy.writeEmail}
          data-cursor-label={copy.writeEmail}
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="contact-menu"
          onClick={onOpenContact}
        >
          <span className="hero-cta-face">
            <span className="hero-cta-word">{copy.ctaWord}</span>
          </span>
        </button>
        <p className="hero-line">{copy.heroLine}</p>
        <a
          className="hero-pill"
          href={MAILTO}
          data-cursor-label={copy.heroBook}
        >
          {copy.heroBook}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
