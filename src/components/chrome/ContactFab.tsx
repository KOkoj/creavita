'use client';

import { useEffect, useRef, useState } from 'react';
import { copy } from '@/lib/copy';
import { isTouch, prefersReducedMotion } from '@/lib/motion';
import ContactMenu from './ContactMenu';

const LIGHT = '.end-screen.is-closing, .end-screen.is-compact, #rezervace, [data-fab-light]';

function fabSize() {
  const mobile = window.matchMedia('(max-width: 800px)').matches;
  return { size: mobile ? 72 : 88, right: mobile ? 16 : 24, bottom: mobile ? 16 : 24 };
}

function liveCta() {
  return (
    Array.from(document.querySelectorAll('.hero-cta, .hero-pill')).find(
      (el) => el.getBoundingClientRect().width > 0
    ) ?? null
  );
}

function onLight(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  return Array.from(document.querySelectorAll(LIGHT)).some((node) => {
    const b = node.getBoundingClientRect();
    return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
  });
}

function luminance(el: HTMLElement) {
  if (onLight(el)) return 1;
  const box = el.getBoundingClientRect();
  const x = Math.min(window.innerWidth - 2, Math.max(2, box.left + box.width / 2));
  const y = Math.min(window.innerHeight - 2, Math.max(2, box.top + box.height / 2));
  const prev = el.style.pointerEvents;
  el.style.pointerEvents = 'none';
  let node = document.elementFromPoint(x, y) as HTMLElement | null;
  el.style.pointerEvents = prev;
  while (node) {
    const m = getComputedStyle(node).backgroundColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (m && (m[4] === undefined || Number(m[4]) > 0.45)) {
      return (
        0.2126 * (Number(m[1]) / 255) +
        0.7152 * (Number(m[2]) / 255) +
        0.0722 * (Number(m[3]) / 255)
      );
    }
    node = node.parentElement;
  }
  return 1;
}

function captureRoll(cta: Element) {
  const anims = cta.getAnimations().filter(
    (a) => (a as CSSAnimation).animationName === 'cta-roll' && a.playState !== 'finished'
  );
  if (!anims.length) return null;
  const timing = anims[0].effect?.getComputedTiming();
  const started = Number(timing?.localTime ?? 0) > Number(timing?.delay ?? 0);
  const before = cta.getBoundingClientRect();
  const matrix = new DOMMatrixReadOnly(
    getComputedStyle(cta).transform === 'none' ? undefined : getComputedStyle(cta).transform
  );
  const angle = (180 * Math.atan2(matrix.b, matrix.a)) / Math.PI;
  anims.forEach((a) => a.finish());
  if (!started) return { dx: 0, dy: 0, angle: 0, fade: true };
  const after = cta.getBoundingClientRect();
  return {
    dx: before.left + before.width / 2 - (after.left + after.width / 2),
    dy: before.top + before.height / 2 - (after.top + after.height / 2),
    angle,
    fade: false,
  };
}

export default function ContactFab({ parked = false }: { parked?: boolean }) {
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const tick = useRef<() => void>(() => {});

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('site-contact-open', onOpen);
    return () => window.removeEventListener('site-contact-open', onOpen);
  }, []);

  useEffect(() => {
    if (parked) return;
    tick.current();
  });

  useEffect(() => {
    const el = btn.current;
    const booking = document.getElementById('rezervace');
    if (!el || !booking || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const hit = entry.isIntersecting;
        el.classList.toggle('is-hidden-booking', hit);
        if (hit) {
          el.setAttribute('tabindex', '-1');
          el.setAttribute('aria-hidden', 'true');
          setOpen(false);
        } else {
          el.removeAttribute('tabindex');
          el.removeAttribute('aria-hidden');
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(booking);
    return () => {
      io.disconnect();
      el.classList.remove('is-hidden-booking');
      el.removeAttribute('tabindex');
      el.removeAttribute('aria-hidden');
    };
  }, [parked]);

  useEffect(() => {
    const el = btn.current;
    if (!el) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const docked = el.classList.contains('is-parked') || el.classList.contains('is-docked');
      el.classList.toggle('is-invert', docked && luminance(el) < 0.62);
      el.classList.toggle('is-on-light', docked && onLight(el));
    };
    const ask = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    ask();
    if (isTouch()) {
      let delay = 0;
      let io: IntersectionObserver | null = null;
      const bind = () => {
        io?.disconnect();
        const size = fabSize();
        const offset = window.innerHeight - size.bottom - size.size / 2;
        io = new IntersectionObserver(
          () => {
            ask();
            window.clearTimeout(delay);
            delay = window.setTimeout(ask, 650);
          },
          {
            rootMargin: `${-Math.round(offset)}px 0px ${-Math.round(window.innerHeight - offset - 1)}px 0px`,
          }
        );
        document
          .querySelectorAll(`.fold, .hero-below, .sg, .end-screen, footer, ${LIGHT}`)
          .forEach((n) => io?.observe(n));
      };
      bind();
      const onResize = () => {
        bind();
        ask();
      };
      window.addEventListener('resize', onResize);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(delay);
        io?.disconnect();
        window.removeEventListener('resize', onResize);
      };
    }
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', ask);
      window.removeEventListener('resize', ask);
    };
  }, [parked]);

  useEffect(() => {
    if (parked) return;
    const el = btn.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    let amount = 0;
    let last = performance.now();
    let raf = 0;
    let handoff: Animation | null = null;
    const reset = () => {
      handoff?.cancel();
      handoff = null;
      el.classList.remove('is-docked', 'is-invert', 'is-on-light');
      el.removeAttribute('style');
      document.documentElement.classList.remove('is-fab');
    };
    const dock = (t: number) => {
      const cta = liveCta();
      if (!cta) return void reset();
      const roll = document.documentElement.classList.contains('is-fab') ? null : captureRoll(cta);
      const size = fabSize();
      const box = cta.getBoundingClientRect();
      const width = box.width;
      if (width <= 0) return;
      const x0 = box.left;
      const y0 = box.top + window.scrollY;
      const x1 = window.innerWidth - size.right - size.size;
      const y1 = window.innerHeight - size.bottom - size.size;
      const scale = (width + (size.size - width) * t) / width;
      const dockAmt = Math.min(1, Math.max(0, (t - 0.42) / 0.38));
      document.documentElement.classList.add('is-fab');
      el.classList.toggle('is-docked', t > 0.98);
      el.classList.toggle('is-invert', t > 0.9 && luminance(el) < 0.62);
      el.classList.toggle('is-on-light', t > 0.9 && onLight(el));
      el.style.setProperty('--dock', dockAmt.toFixed(3));
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      el.style.left = `${x0 + (x1 - x0) * t}px`;
      el.style.top = `${y0 + (y1 - y0) * t}px`;
      el.style.width = `${width}px`;
      el.style.height = `${width}px`;
      el.style.transformOrigin = 'top left';
      el.style.transform = `scale(${scale})`;
      el.style.setProperty('--fs', scale.toFixed(4));
      if (roll && !reduced) {
        handoff?.cancel();
        handoff = roll.fade
          ? el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' })
          : el.animate(
              [
                { translate: `${roll.dx}px ${roll.dy}px`, rotate: `${roll.angle}deg` },
                { translate: '0px 0px', rotate: '0deg' },
              ],
              { duration: 300, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
            );
        handoff.onfinish = () => {
          handoff = null;
        };
      }
    };
    const loop = (now: number) => {
      raf = 0;
      const cta = liveCta();
      const fold = document.querySelector('.fold');
      const y = window.scrollY;
      const ready = !!(fold?.classList.contains('is-shown') || fold?.classList.contains('is-settled'));
      if (!cta || !fold || (!ready && y < 2)) {
        amount = 0;
        last = now;
        reset();
        return;
      }
      const span = Math.min(640, Math.max(380, 0.62 * window.innerHeight));
      const raw = reduced ? +(y > 8) : Math.min(1, Math.max(0, y / span));
      const target = raw * raw * (3 - 2 * raw);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt / 0.28);
      amount += (target - amount) * k;
      if (amount < 0.001 && target < 0.001) {
        amount = 0;
        reset();
        return;
      }
      dock(amount);
      if (Math.abs(target - amount) > 0.0015) raf = requestAnimationFrame(loop);
    };
    const ask = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    if (isTouch()) {
      const cta = liveCta();
      const fold = document.querySelector('.fold');
      if (!cta || !fold) {
        reset();
        return;
      }
      let off = false;
      const sync = () => {
        const ready = fold.classList.contains('is-shown') || fold.classList.contains('is-settled');
        if (!off || !ready) {
          reset();
          el.classList.remove('is-touch-dock');
          return;
        }
        dock(1);
        el.classList.add('is-touch-dock');
      };
      const io = new IntersectionObserver(([entry]) => {
        off = !entry.isIntersecting;
        sync();
      });
      io.observe(cta);
      const mo = new MutationObserver(sync);
      mo.observe(fold, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener('resize', sync);
      return () => {
        io.disconnect();
        mo.disconnect();
        window.removeEventListener('resize', sync);
        el.classList.remove('is-touch-dock');
        reset();
      };
    }
    tick.current = ask;
    ask();
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    return () => {
      tick.current = () => {};
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', ask);
      window.removeEventListener('resize', ask);
      reset();
    };
  }, [parked]);

  const toggle = () => setOpen((v) => !v);

  return (
    <>
      <button
        type="button"
        className={parked ? 'contact-fab is-parked' : 'contact-fab'}
        aria-label={`${copy.cta1} ${copy.cta2}`}
        data-cursor-label={open ? copy.closeOffer : copy.writeEmail}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="contact-menu"
        ref={btn}
        onClick={toggle}
      >
        <span className="contact-fab-face">
          <span className="contact-fab-word">{copy.ctaWord}</span>
        </span>
        <svg className="contact-fab-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <ContactMenu
        id="contact-menu"
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={btn}
      />
    </>
  );
}
