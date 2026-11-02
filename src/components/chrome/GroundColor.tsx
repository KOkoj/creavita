'use client';

import { useEffect } from 'react';
import { isTouch } from '@/lib/motion';
import { useLenis } from '@/lib/lenis';

const NIGHT: [number, number, number] = [18, 17, 2];
const BLACK: [number, number, number] = [0, 0, 0];
const PAPER_INK: [number, number, number] = [18, 18, 17];
const WHITE: [number, number, number] = [255, 255, 255];

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function paint(color: string) {
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
}

function guidesClear() {
  const sg = document.querySelector('.sg');
  const on = (() => {
    if (!sg) return false;
    const box = sg.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    return box.top <= mid && box.bottom >= mid;
  })();
  document.documentElement.classList.toggle('is-guides-clear', on);
}

function apply(scrollY: number) {
  const root = document.documentElement;
  guidesClear();
  const nodes = Array.from(document.querySelectorAll('.fold, .hero-below, .end-screen'));
  if (nodes.length < 2) {
    root.style.removeProperty('--ground');
    root.style.removeProperty('--ink');
    root.style.removeProperty('--line');
    root.style.removeProperty('--hair');
    root.style.removeProperty('background-color');
    document.body.style.removeProperty('background-color');
    return;
  }
  const tops = nodes.map((el) => el.getBoundingClientRect().top + window.scrollY);
  const last = tops.length - 1;
  const span = tops[last] - tops[last - 1];
  const windowSpan = Math.min(Math.max(span, 1), window.innerHeight);
  const local = scrollY - tops[last - 1] - (span - windowSpan);
  const gRaw = span <= 0 ? +(scrollY >= tops[last]) : Math.min(1, Math.max(0, local / windowSpan));
  const g = gRaw * gRaw * (3 - 2 * gRaw);
  const sg = document.querySelector('.sg');
  const vRaw = sg
    ? Math.min(1, Math.max(0, 1 - sg.getBoundingClientRect().top / Math.max(window.innerHeight, 1)))
    : 0;
  const v = vRaw * vRaw * (3 - 2 * vRaw);
  const ground = mix(NIGHT, BLACK, g);
  const page = mix(mix(NIGHT, WHITE, v), BLACK, g);
  const ink = mix(PAPER_INK, WHITE, g);
  root.style.setProperty('--ground', `rgb(${ground.join(' ')})`);
  paint(`rgb(${page.join(' ')})`);
  if (g <= 0) {
    root.style.removeProperty('--ink');
    root.style.removeProperty('--line');
    root.style.removeProperty('--hair');
    return;
  }
  root.style.setProperty('--ink', `rgb(${ink.join(' ')})`);
  root.style.setProperty('--line', `rgba(${ink.join(', ')}, 0.172)`);
  root.style.setProperty('--hair', `rgba(${ink.join(', ')}, 0.075)`);
}

function clearVars() {
  const root = document.documentElement;
  root.style.removeProperty('--ground');
  root.style.removeProperty('--ink');
  root.style.removeProperty('--line');
  root.style.removeProperty('--hair');
  root.style.removeProperty('background-color');
  document.body.style.removeProperty('background-color');
}

export default function GroundColor() {
  const lenis = useLenis();

  useEffect(() => {
    if (isTouch()) {
      const root = document.documentElement;
      let zone = '';
      let pauseTimer = 0;
      const tick = () => {
        const sections = Array.from(
          document.querySelectorAll('.fold, .hero-below, .end-screen')
        );
        if (sections.length < 2) {
          apply(0);
          zone = '';
          return;
        }
        const mid = window.innerHeight / 2;
        const sg = document.querySelector('.sg');
        const next = sg && sg.getBoundingClientRect().top <= mid ? 'projects' : 'hero';
        guidesClear();
        if (next === zone) return;
        zone = next;
        const clear = next !== 'hero';
        root.classList.toggle('is-ground-clear', clear);
        window.clearTimeout(pauseTimer);
        const media = document.querySelectorAll('.hero-media video, .hero-media canvas');
        if (clear) {
          pauseTimer = window.setTimeout(() => {
            media.forEach((el) => {
              if (el instanceof HTMLVideoElement) el.pause();
            });
          }, 650);
        }
        root.classList.toggle('is-projects-white', next === 'projects');
        root.style.setProperty('--ground', `rgb(${NIGHT.join(' ')})`);
        root.style.setProperty('--page', `rgb(${NIGHT.join(' ')})`);
        paint(`rgb(${NIGHT.join(' ')})`);
        root.style.removeProperty('--ink');
        root.style.removeProperty('--line');
        root.style.removeProperty('--hair');
      };
      root.classList.add('is-touch-ground');
      const io = new IntersectionObserver(tick, { rootMargin: '-50% 0px -50% 0px' });
      document.querySelectorAll('.fold, .hero-below, .end-screen, .sg').forEach((el) => io.observe(el));
      tick();
      window.addEventListener('resize', tick);
      return () => {
        io.disconnect();
        window.removeEventListener('resize', tick);
        root.classList.remove('is-touch-ground', 'is-ground-clear', 'is-guides-clear', 'is-projects-white');
        window.clearTimeout(pauseTimer);
        root.style.removeProperty('--page');
        clearVars();
      };
    }

    apply(window.scrollY);
    const onResize = () => apply(window.scrollY);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', guidesClear, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', guidesClear);
      document.documentElement.classList.remove('is-guides-clear');
      clearVars();
    };
  }, []);

  useEffect(() => {
    if (!lenis || isTouch()) return;
    const onScroll = (e: { scroll: number }) => apply(e.scroll);
    lenis.on('scroll', onScroll);
    return () => {
      lenis.off('scroll', onScroll);
    };
  }, [lenis]);

  return null;
}
