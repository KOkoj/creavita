'use client';

import { useSyncExternalStore } from 'react';

const TOUCH = '(hover: none) and (pointer: coarse)';

export function isTouch() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(TOUCH).matches;
}

export function useIsTouch() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(TOUCH);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(TOUCH).matches,
    () => false
  );
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
