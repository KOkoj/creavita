'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { copy } from '@/lib/copy';
import { useLenis } from '@/lib/lenis';
import { prefersReducedMotion } from '@/lib/motion';
import { easeOutQuad } from '@/lib/scroll';

gsap.registerPlugin(ScrollTrigger);

type Marks = {
  start: number;
  distance: number;
  marks: number[];
  index: number;
};

export default function ScrollRail() {
  const wrap = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLElement>(null);
  const up = useRef<HTMLButtonElement>(null);
  const down = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; scroll: number } | null>(null);
  const live = useRef<Marks | null>(null);
  const pending = useRef<number | null>(null);
  const lenis = useLenis();

  const paint = (state: {
    limit: number;
    scroll: number;
    progress: number;
    isScrolling?: boolean;
  }) => {
    const root = wrap.current;
    const track = rail.current;
    const bar = thumb.current;
    if (!root || !track || !bar) return;
    const sg = document.querySelector('.sg') as HTMLElement | null;
    const marks =
      sg?.dataset.slideMarks
        ?.split(',')
        .map(Number)
        .filter((n) => Number.isFinite(n)) ?? [];
    const trigger = ScrollTrigger.getAll().find((t) => t.trigger === sg);
    const gallery = sg?.closest('.work-gallery');
    const galleryBox = gallery?.getBoundingClientRect();
    const booking = document.getElementById('rezervace')?.getBoundingClientRect();
    const inProjects = !!(
      !(booking && booking.top < window.innerHeight - 48 && booking.bottom > 0) &&
      gallery?.classList.contains('is-full') &&
      galleryBox &&
      galleryBox.top < window.innerHeight - 48 &&
      galleryBox.bottom > 48 &&
      trigger &&
      marks.length > 1
    );
    root.classList.toggle('is-projects', inProjects);
    const limit = state.limit;
    const trackH = track.clientHeight;
    const vh = window.innerHeight;
    const thumbH = limit <= 1 ? trackH : Math.max(56, Math.min(trackH, (vh / (limit + vh)) * trackH));
    const travel = Math.max(0, trackH - thumbH);
    const y = limit <= 1 || travel === 0 ? 0 : (state.scroll / limit) * travel;
    bar.style.height = `${thumbH}px`;
    bar.style.transform = `translate3d(-50%, ${y}px, 0)`;
    track.classList.toggle('is-idle', limit <= 1);
    track.setAttribute('aria-valuenow', String(Math.round(100 * (state.progress || 0))));
    if (!state.isScrolling) pending.current = null;
    if (inProjects && trigger) {
      const distance = trigger.end - trigger.start;
      const p = distance > 0 ? (state.scroll - trigger.start) / distance : 0;
      let index = 0;
      for (let i = 0; i < marks.length; i++) {
        if (p + 0.012 >= marks[i]) index = i;
      }
      live.current = { start: trigger.start, distance, marks, index };
      const shown = pending.current ?? index;
      if (up.current) up.current.disabled = shown <= 0;
      if (down.current) down.current.disabled = shown >= marks.length - 1;
    } else {
      live.current = null;
      pending.current = null;
    }
  };

  useEffect(() => {
    if (!lenis) {
      const onWin = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        paint({
          limit: Math.max(0, max),
          scroll: window.scrollY,
          progress: max > 0 ? window.scrollY / max : 0,
        });
      };
      onWin();
      window.addEventListener('scroll', onWin, { passive: true });
      window.addEventListener('resize', onWin);
      return () => {
        window.removeEventListener('scroll', onWin);
        window.removeEventListener('resize', onWin);
      };
    }
    const onScroll = () =>
      paint({
        limit: lenis.limit,
        scroll: lenis.scroll,
        progress: lenis.progress,
        isScrolling: Boolean(lenis.isScrolling),
      });
    const unsub = lenis.on('scroll', onScroll);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener('resize', onScroll);
    };
  }, [lenis]);

  const step = (dir: -1 | 1) => {
    const marks = live.current;
    if (!marks) return;
    const from = pending.current ?? marks.index;
    const next = Math.min(marks.marks.length - 1, Math.max(0, from + dir));
    if (next === from) return;
    pending.current = next;
    const reduced = prefersReducedMotion();
    const y = marks.start + marks.marks[next] * marks.distance;
    if (lenis) {
      lenis.scrollTo(y, {
        duration: reduced ? 0 : 2.2,
        easing: easeOutQuad,
        onComplete: () => {
          pending.current = null;
        },
      });
    } else {
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      pending.current = null;
    }
    if (up.current) up.current.disabled = next <= 0;
    if (down.current) down.current.disabled = next >= marks.marks.length - 1;
  };

  const nativeScroll = () => ({
    limit: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    scroll: window.scrollY,
  });

  return (
    <div className="scroll-rail-wrap" ref={wrap}>
      <div className="scroll-steps">
        <button
          className="scroll-step is-up"
          type="button"
          ref={up}
          aria-label={copy.prevProject}
          data-cursor-label={copy.prevProject}
          onClick={() => step(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 14.5 12 8.5l6 6" />
          </svg>
        </button>
        <button
          className="scroll-step is-down"
          type="button"
          ref={down}
          aria-label={copy.nextProject}
          data-cursor-label={copy.nextProject}
          onClick={() => step(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9.5 12 15.5l6-6" />
          </svg>
        </button>
      </div>
      <div
        className="scroll-rail"
        ref={rail}
        role="scrollbar"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-label={copy.scroll}
        tabIndex={0}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const box = thumb.current?.getBoundingClientRect();
          const api = lenis ?? nativeScroll();
          if (!(box && e.clientY >= box.top && e.clientY <= box.bottom) && box) {
            const page = 0.82 * window.innerHeight;
            const next = api.scroll + (e.clientY < box.top ? -page : page);
            if (lenis) lenis.scrollTo(next, { duration: 0.7 });
            else window.scrollTo({ top: next, behavior: 'smooth' });
            return;
          }
          drag.current = { y: e.clientY, scroll: api.scroll };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const track = rail.current;
          const bar = thumb.current;
          if (!d || !track || !bar) return;
          const travel = track.clientHeight - bar.offsetHeight;
          const limit = lenis ? lenis.limit : nativeScroll().limit;
          if (travel <= 0 || limit <= 0) return;
          const next = d.scroll + ((e.clientY - d.y) / travel) * limit;
          const clamped = Math.min(limit, Math.max(0, next));
          if (lenis) lenis.scrollTo(clamped, { immediate: true });
          else window.scrollTo(0, clamped);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          const api = lenis ?? nativeScroll();
          const vh = window.innerHeight;
          const map: Record<string, number> = {
            ArrowDown: 0.12 * vh,
            ArrowUp: -0.12 * vh,
            PageDown: 0.86 * vh,
            PageUp: -0.86 * vh,
            Home: -api.scroll,
            End: api.limit - api.scroll,
          };
          const delta = map[e.key];
          if (delta === undefined) return;
          e.preventDefault();
          const next = api.scroll + delta;
          if (lenis) lenis.scrollTo(next, { duration: 0.6 });
          else window.scrollTo({ top: next, behavior: 'smooth' });
        }}
      >
        <i />
        <b ref={thumb} />
      </div>
    </div>
  );
}
