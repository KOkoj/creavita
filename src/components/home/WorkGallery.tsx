'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '@/data/projects';
import { copy } from '@/lib/copy';
import { useIsTouch } from '@/lib/motion';
import { useLenis } from '@/lib/lenis';

gsap.registerPlugin(ScrollTrigger);

type Slide = {
  title: string;
  kind: string;
  url: string;
  image: string;
  alt: string;
  linkLabel: string;
};

const NONE = 'linear-gradient(to bottom, transparent 0%, transparent 100%)';

function srcSet(src: string) {
  return undefined as string | undefined;
}

function setMask(el: HTMLElement, value: string) {
  el.style.maskImage = value;
  (el.style as any).webkitMaskImage = value;
}

function scaleSetter(el: HTMLElement, from: number) {
  const set = (v: number) => {
    el.style.transform = `translate3d(0, 0, 0) scale(${v})`;
  };
  set(from);
  return set;
}

function stripGradient(
  strips: { lower: number; upperGap: number; delay: number }[],
  amount: (i: number, s: { delay: number }) => number
) {
  const ranges: { top: number; bottom: number }[] = [];
  strips.forEach((s, i) => {
    const t = Math.max(0, Math.min(1, amount(i, s)));
    if (t <= 0) return;
    const span = s.lower - s.upperGap;
    ranges.push({ top: s.lower - t * span, bottom: s.lower });
  });
  ranges.sort((a, b) => a.top - b.top);
  const merged: { top: number; bottom: number }[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.top <= last.bottom) last.bottom = Math.max(last.bottom, r.bottom);
    else merged.push({ ...r });
  }
  if (!merged.length) return NONE;
  const stops: string[] = [];
  let cursor = 0;
  for (const { top, bottom } of merged) {
    if (top > cursor) {
      stops.push(`transparent ${cursor}%`, `transparent ${top}%`);
    }
    stops.push(`black ${top}%`, `black ${bottom}%`);
    cursor = bottom;
  }
  if (cursor < 100) stops.push(`transparent ${cursor}%`, 'transparent 100%');
  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

function MotionGallery({ slides }: { slides: Slide[] }) {
  const root = useRef<HTMLElement>(null);
  const images = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLImageElement>(null);
  const title = useRef<HTMLParagraphElement>(null);
  const kind = useRef<HTMLSpanElement>(null);
  const open = useRef<HTMLAnchorElement>(null);
  const shot = useRef<HTMLAnchorElement>(null);
  const lenis = useLenis();
  const [preOpen, setPreOpen] = useState(true);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const openAt = useRef(0);

  useEffect(() => {
    const section = root.current;
    const imgs = images.current;
    const base = frame.current;
    if (!section || !imgs || !base || slides.length === 0) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let killed = false;
    const extras: HTMLDivElement[] = [];
    const scaleFrom = 1.12;
    const scaleTo = 1;
    const stripsCount = 14;
    const scrollPer = 600;
    const openDur = 760;
    const initialDelay = 280;
    const hold = 280;
    const finalDelay = 180;
    const titleChange = 0.3;
    const titleDur = 0.3;
    const stripSpeed = 2;
    const range = (scaleFrom - scaleTo) / 2;

    const run = async () => {
      await (document.fonts?.ready ?? Promise.resolve());
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (killed || root.current !== section) return;

      const strips = Array.from({ length: stripsCount }, (_, i) => {
        const a = stripsCount - i - 1;
        const r = 100 / stripsCount;
        return { lower: (a + 1) * r, upperGap: a * r - 0.1, delay: (i / stripsCount) * 0.5 };
      });
      const setBase = scaleSetter(base, scaleFrom);
      type Layer = {
        index: number;
        img: HTMLImageElement;
        container: HTMLDivElement;
        visible: boolean;
        setScale: (n: number) => void;
        reveal: 'hidden' | 'animating' | 'revealed';
      };
      const layers: Layer[] = [];
      for (let i = 1; i < slides.length; i++) {
        const wrap = document.createElement('div');
        wrap.style.cssText =
          'position:absolute;top:0;left:0;width:100%;height:100%;transform:translateZ(0);backface-visibility:hidden;';
        const img = document.createElement('img');
        img.style.cssText =
          'width:100%;height:100%;object-fit:cover;transform-origin:center center;backface-visibility:hidden;mask-size:100% 100%;-webkit-mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;will-change:transform;';
        img.src = slides[i].image;
        img.alt = slides[i].alt;
        img.decoding = 'async';
        setMask(img, NONE);
        wrap.style.visibility = 'hidden';
        wrap.appendChild(img);
        imgs.appendChild(wrap);
        extras.push(wrap);
        layers.push({
          index: i - 1,
          img,
          container: wrap,
          visible: false,
          setScale: scaleSetter(img, scaleFrom),
          reveal: 'hidden',
        });
      }
      const q = slides.length - 1;
      const distance = openDur + q * scrollPer + initialDelay + Math.max(0, q - 1) * hold + finalDelay;
      const windows: { startPercent: number; endPercent: number }[] = [];
      let cursor = openDur + initialDelay;
      for (let i = 0; i < q; i++) {
        const start = cursor;
        const end = start + scrollPer;
        windows.push({ startPercent: start / distance, endPercent: end / distance });
        cursor = end + (i < q - 1 ? hold : 0);
      }
      const openPct = distance > 0 ? openDur / distance : 0;
      const marks = windows.length
        ? [
            (openPct + windows[0].startPercent) / 2,
            ...windows.map((w, i) => {
              const n = windows[i + 1]?.startPercent ?? 1;
              return (w.endPercent + n) / 2;
            }),
          ]
        : [0];
      section.dataset.slideMarks = marks.map((m) => m.toFixed(5)).join(',');

      const scaleAt = (idx: number, floor: number, frac: number) => {
        const n = floor + frac - idx;
        if (n <= 0) return scaleFrom;
        if (n >= 2) return scaleTo;
        return scaleFrom - range * n;
      };
      let current = 0;
      let pending: number | null = null;
      let tweening = false;
      let lastMix = 0;
      let openStr = '';
      let full: boolean | null = null;
      let live: boolean | null = null;
      let firstVisible = true;
      const gallery = section.closest('.work-gallery');
      const masks = new WeakMap<HTMLImageElement, string>();

      const bindLinks = (i: number) => {
        const s = slides[i];
        if (open.current) {
          open.current.href = s.url;
          open.current.setAttribute('aria-label', s.linkLabel);
        }
        if (shot.current) {
          shot.current.href = s.url;
          shot.current.setAttribute('aria-label', s.linkLabel);
        }
        section.querySelectorAll('.sg-projects a').forEach((a) => {
          if (Number((a as HTMLElement).dataset.index) === i) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      };
      const setKind = (i: number) => {
        if (kind.current) kind.current.textContent = slides[i].kind;
      };
      const changeTitle = (next: number, dir: 'down' | 'up') => {
        if (!title.current || next === current || next < 0 || next >= slides.length) return;
        if (slides[next].title === slides[current].title) {
          current = next;
          bindLinks(next);
          setKind(next);
          if (pending !== null && pending !== current) {
            const p = pending;
            pending = null;
            changeTitle(p, dir);
          }
          return;
        }
        if (tweening) {
          pending = next;
          return;
        }
        tweening = true;
        const out = dir === 'down' ? '-120%' : '120%';
        const inn = dir === 'down' ? '120%' : '-120%';
        gsap.killTweensOf(title.current);
        bindLinks(next);
        gsap.to(title.current, {
          y: out,
          duration: titleDur,
          ease: 'power2.out',
          onComplete: () => {
            if (!title.current) return;
            title.current.textContent = slides[next].title;
            setKind(next);
            gsap.set(title.current, { y: inn });
            gsap.to(title.current, {
              y: '0%',
              duration: titleDur,
              ease: 'power2.out',
              onComplete: () => {
                current = next;
                tweening = false;
                if (pending !== null && pending !== current) {
                  const p = pending;
                  pending = null;
                  changeTitle(p, dir);
                }
              },
            });
          },
        });
      };

      const onUpdate = (progress: number) => {
        const openAmt = openPct <= 0 ? 1 : Math.min(1, Math.max(0, progress / openPct));
        const smooth = openAmt * openAmt * (3 - 2 * openAmt);
        const isFull = openAmt >= 1;
        const str = smooth.toFixed(4);
        if (str !== openStr) {
          section.style.setProperty('--sg-open', str);
          openStr = str;
        }
        if (isFull !== full) {
          gallery?.classList.toggle('is-full', isFull);
          setPreOpen(!isFull);
          full = isFull;
        }
        const isLive = smooth >= 0.98;
        if (isLive !== live) {
          section.querySelector('.sg-name')?.classList.toggle('is-live', isLive);
          live = isLive;
        }
        let mix = 0;
        const first = windows[0];
        const last = windows.at(-1);
        if (first && last) {
          if (progress < first.startPercent) mix = 0;
          else if (progress > last.endPercent) mix = windows.length;
          else {
            for (let i = 0; i < windows.length; i++) {
              const { startPercent, endPercent } = windows[i];
              if (progress >= startPercent && progress <= endPercent) {
                mix = i + (progress - startPercent) / (endPercent - startPercent);
                break;
              }
              const nxt = windows[i + 1];
              if (nxt && progress > endPercent && progress < nxt.startPercent) {
                mix = i + 1;
                break;
              }
            }
          }
        }
        const dir = mix > lastMix ? 'down' : 'up';
        const floor = Math.floor(mix);
        const frac = mix - floor;
        const titleIdx = mix - floor >= titleChange ? Math.min(floor + 1, slides.length - 1) : floor;
        if (Math.abs(mix - lastMix) > 0.85 && titleIdx !== current) {
          gsap.killTweensOf(title.current);
          if (title.current) {
            title.current.textContent = slides[titleIdx].title;
            gsap.set(title.current, { y: '0%' });
          }
          current = titleIdx;
          tweening = false;
          pending = null;
          bindLinks(titleIdx);
          setKind(titleIdx);
        } else if (titleIdx !== current) {
          pending = titleIdx;
          if (!tweening) changeTitle(titleIdx, dir);
        }
        const s = scaleAt(0, floor, frac);
        const showFirst = floor < 1;
        if (showFirst !== firstVisible) {
          firstVisible = showFirst;
          const parent = base.parentElement;
          (parent && parent !== imgs ? parent : base).style.visibility = showFirst ? '' : 'hidden';
        }
        if (showFirst) setBase(mix === 0 ? s + (1 - smooth) * 0.07 : s);
        for (const layer of layers) {
          const on = layer.index === floor || layer.index === floor - 1;
          if (layer.visible !== on) {
            layer.visible = on;
            layer.container.style.visibility = on ? '' : 'hidden';
          }
          if (on) layer.setScale(scaleAt(layer.index, floor, frac));
          if (layer.index < floor) {
            if (layer.reveal !== 'revealed') {
              setMask(layer.img, 'linear-gradient(to bottom, black 0%, black 100%)');
              masks.delete(layer.img);
              layer.reveal = 'revealed';
            }
          } else if (layer.index === floor) {
            layer.reveal = 'animating';
            const g = stripGradient(strips, (_, st) =>
              Math.max(0, Math.min(1, (frac - st.delay) * stripSpeed))
            );
            if (masks.get(layer.img) !== g) {
              setMask(layer.img, g);
              masks.set(layer.img, g);
            }
          } else if (layer.reveal !== 'hidden') {
            setMask(layer.img, NONE);
            masks.delete(layer.img);
            layer.reveal = 'hidden';
          }
        }
        lastMix = mix;
      };

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${distance}vh`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => onUpdate(self.progress),
      });
      triggerRef.current = st;
      openAt.current = openPct;
      onUpdate(st.progress);
      ScrollTrigger.refresh();
    };
    run();
    return () => {
      killed = true;
      triggerRef.current?.kill();
      triggerRef.current = null;
      extras.forEach((n) => n.remove());
      base.style.visibility = '';
    };
  }, [slides, lenis]);

  const expand = () => {
    const st = triggerRef.current;
    const l = lenis;
    const a = openAt.current;
    if (!st || a <= 0 || st.progress >= a - 0.004) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = st.start + a * (st.end - st.start);
    if (l) l.scrollTo(target, { duration: reduced ? 0 : 1.35 });
    else window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
  };

  const first = slides[0];
  if (!first) return null;

  return (
    <section className="sg" ref={root}>
      <div className="sg-enter">
        <p>{copy.selectedWork}</p>
        <i />
      </div>
      <div
        className="sg-images"
        ref={images}
        role={preOpen ? 'button' : undefined}
        tabIndex={preOpen ? 0 : undefined}
        aria-label={preOpen ? copy.expand : undefined}
        data-cursor-label={preOpen ? copy.expand : undefined}
        onClick={expand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            expand();
          }
        }}
      >
        <div className="sg-frame">
          <img
            alt={first.alt}
            data-active-shot=""
            decoding="async"
            ref={frame}
            sizes="100vw"
            src={first.image}
            style={{ backfaceVisibility: 'hidden', transform: 'translate3d(0, 0, 0) scale(1.12)' }}
          />
        </div>
      </div>
      <a
        className="sg-shot"
        aria-label={first.linkLabel}
        data-cursor-label={copy.viewProject}
        href={first.url}
        ref={shot}
      />
      <div className="sg-name">
        <span className="sg-kind" ref={kind}>
          {first.kind}
        </span>
        <div className="sg-menu">
          <div className="sg-title">
            <p ref={title}>{first.title}</p>
          </div>
          <div className="sg-projects">
            <ul>
              {slides.map((s, i) => (
                <li key={s.url}>
                  <a aria-current={i === 0 ? 'true' : undefined} data-index={i} href={s.url}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <a
          className="sg-open"
          aria-label={first.linkLabel}
          data-cursor-label={copy.viewProject}
          href={first.url}
          ref={open}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h12M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}

function TouchGallery({ slides }: { slides: Slide[] }) {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const slide = slides[i];
  const n = slides.length;

  const go = (next: number) => setI(((next % n) + n) % n);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.closest('.work-gallery')?.classList.add('is-touch');
    return () => el.closest('.work-gallery')?.classList.remove('is-touch');
  }, []);

  if (!slide) return null;
  return (
    <section className="sg sg-touch" data-touch="" ref={root}>
      <div className="sgt-head">
        <h3>{copy.selectedWork}</h3>
        <span className="sgt-count" aria-live="polite">
          {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
      </div>
      <div className="sgt-stage">
        <a
          className="sgt-card"
          href={slide.url}
          aria-label={`${slide.title}: ${slide.linkLabel}`}
          data-cursor-label={copy.viewProject}
          draggable={false}
          onPointerDown={(e) => {
            start.current = { x: e.clientX, y: e.clientY, moved: false };
          }}
          onPointerUp={(e) => {
            const s = start.current;
            if (!s) return;
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            if (Math.abs(dx) >= 40 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
              s.moved = true;
              go(i + (dx < 0 ? 1 : -1));
            }
          }}
          onClick={(e) => {
            if (start.current?.moved) e.preventDefault();
            start.current = null;
          }}
        >
          {slides.map((s, idx) => (
            <span key={s.url} className={idx === i ? 'sgt-slide is-on' : 'sgt-slide'} aria-hidden={idx !== i}>
              <img alt={s.alt} decoding="async" loading="lazy" src={s.image} />
            </span>
          ))}
        </a>
        <button
          type="button"
          className="sgt-arrow is-prev"
          aria-label={copy.prevProject}
          onClick={() => go(i - 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H7M11 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          className="sgt-arrow is-next"
          aria-label={copy.nextProject}
          onClick={() => go(i + 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h12M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="sgt-info">
        <p className="sgt-title">{slide.title}</p>
        <p className="sgt-meta">
          <span>{slide.kind}</span>
        </p>
      </div>
      <div className="sgt-controls">
        <a className="sgt-open" href={slide.url}>
          {copy.viewProject}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

export default function WorkGallery() {
  const touch = useIsTouch();
  const slides = useMemo<Slide[]>(
    () =>
      projects.map((p) => ({
        title: p.client,
        kind: p.type,
        url: `/projekty/${p.slug}/`,
        image: p.images[0].src,
        alt: p.images[0].alt,
        linkLabel: copy.caseStudy,
      })),
    []
  );

  return (
    <section className="work-gallery" id="prace" aria-label={copy.selectedWork}>
      <h2 className="sr-only">{copy.selectedWork}</h2>
      <div className="work-gallery-motion">
        {touch ? <TouchGallery slides={slides} /> : <MotionGallery slides={slides} />}
      </div>
      <div className="work-gallery-still">
        {slides.map((s) => (
          <figure key={s.url}>
            <a href={s.url} aria-label={s.linkLabel}>
              <img alt={s.alt} decoding="async" src={s.image} />
            </a>
            <figcaption>
              <strong>{s.title}</strong>
              <a href={s.url}>{s.linkLabel}</a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
