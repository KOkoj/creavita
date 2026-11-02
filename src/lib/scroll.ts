import type Lenis from 'lenis';
import { prefersReducedMotion } from './motion';

export function scrollToTarget(
  target: string | number,
  lenis?: Lenis | null,
  immediate = false
) {
  const reduced = prefersReducedMotion() || immediate;
  if (typeof target === 'string') {
    if (target === '#top') {
      if (lenis) lenis.scrollTo(0, { immediate: reduced, force: true });
      else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    const el = document.getElementById(target.replace(/^#/, ''));
    if (!el) return;
    if (lenis) lenis.scrollTo(el, reduced ? { immediate: true } : undefined);
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    return;
  }
  if (lenis) lenis.scrollTo(target, { immediate: reduced, force: true });
  else window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
}

export const easeOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
