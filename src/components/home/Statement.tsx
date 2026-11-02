'use client';

import { useLayoutEffect, useRef } from 'react';
import { copy } from '@/lib/copy';
import { isTouch, prefersReducedMotion } from '@/lib/motion';

export default function Statement({
  infoRef,
}: {
  infoRef: React.RefObject<HTMLElement | null>;
}) {
  const leadRef = useRef<HTMLParagraphElement>(null);
  const words = `${copy.leadBefore} ${copy.leadAfter}`.split(/\s+/).filter(Boolean);
  const wrap = copy.leadWrap.trim();
  const match = wrap.match(/^(.*?)([.!?]+)$/);
  const wrapText = (match?.[1] ?? wrap).trim();
  const wrapTail = match?.[2] ?? '';

  useLayoutEffect(() => {
    const pin = infoRef.current;
    const lead = leadRef.current;
    if (!pin || !lead) return;
    const items = Array.from(lead.querySelectorAll('.lead-word, .lead-line')) as HTMLElement[];
    const mark = lead.querySelector('.lead-mark') as HTMLElement | null;
    if (prefersReducedMotion()) {
      mark?.style.setProperty('--mark', '1');
      return;
    }
    const apply = (progress: number, fade: number) => {
      const inAmt = Math.min(1, progress / 0.62);
      const markAmt = Math.min(1, Math.max(0, (progress - 0.62) / 0.14));
      lead.style.opacity = `${1 - fade}`;
      lead.style.transform = `scale(${0.9 + 0.1 * inAmt})`;
      mark?.style.setProperty('--mark', (1 - (1 - markAmt) ** 3).toFixed(4));
      items.forEach((el, i) => {
        const n =
          1 -
          (1 - Math.min(1, Math.max(0, (inAmt - (i / items.length) * 0.42) / 0.58))) ** 3;
        el.style.transform = `translate3d(0, ${(1 - n) * 18 * (i % 2 === 0 ? -1 : 1)}px, 0)`;
        el.style.opacity = `${0.28 + 0.72 * n}`;
      });
    };
    if (isTouch()) {
      apply(0, 0);
      let raf = 0;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          const t0 = performance.now();
          const tick = (t: number) => {
            const a = Math.min(1, (t - t0) / 1300);
            const eased = a < 0.5 ? 4 * a * a * a : 1 - (-2 * a + 2) ** 3 / 2;
            apply(0.76 * eased, 0);
            if (a < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        },
        { threshold: 0.3 }
      );
      io.observe(lead);
      return () => {
        io.disconnect();
        cancelAnimationFrame(raf);
      };
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const top = pin.getBoundingClientRect().top;
        const span = 1.4 * window.innerHeight;
        const p =
          span > 1
            ? Math.min(1, Math.max(0, -top / span))
            : Math.min(1, Math.max(0, 1 - top / window.innerHeight));
        const h = window.innerHeight;
        const fade = Math.min(
          1,
          Math.max(
            0,
            (-top - (Math.max(h, pin.offsetHeight - h) - 0.28 * h)) / (0.28 * h)
          )
        );
        apply(p, fade);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [infoRef]);

  return (
    <section className="hero-below" ref={infoRef}>
      <div className="statement-pin">
        <p className="lead" ref={leadRef}>
          {words.map((w, i) => (
            <span className="lead-word" key={`${w}-${i}`}>
              {w}
            </span>
          ))}
          <br />
          <span className="lead-line">
            <span className="lead-mark">
              {wrapText}
              {wrapTail}
              <span className="lead-fill" aria-hidden="true">
                <span className="lead-bar" />
                <span className="lead-fill-text">
                  {wrapText}
                  {wrapTail}
                </span>
              </span>
            </span>
          </span>
        </p>
      </div>
    </section>
  );
}
