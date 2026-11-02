'use client';

import { useEffect, useRef } from 'react';
import { useIsTouch } from '@/lib/motion';

export default function CursorTip() {
  const ref = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();

  useEffect(() => {
    if (touch) return;
    const el = ref.current;
    if (!el) return;
    const span = el.querySelector('span');
    if (!span) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const move = (e: PointerEvent) => {
      tx = e.clientX + 16;
      ty = e.clientY + 18;
    };
    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest('[data-cursor-label]');
      const label = target?.getAttribute('data-cursor-label') ?? '';
      span.textContent = label;
      el.classList.toggle('is-on', Boolean(label));
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
    };
  }, [touch]);

  if (touch) return null;
  return (
    <div className="cursor-tip" ref={ref} aria-hidden="true">
      <span />
    </div>
  );
}
