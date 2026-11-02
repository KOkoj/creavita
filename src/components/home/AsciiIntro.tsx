'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLenis } from '@/lib/lenis';
import { prefersReducedMotion } from '@/lib/motion';

const BRAND = 'CREAVITA';
const COLS = 15;
const ROWS = 9;
const DIRS = ['up', 'up-right', 'right', 'down', 'left'] as const;
const EXIT_MS = 820;
const TYPE_MS = 90;
const READY_HOLD_MS = 700;
const PATTERN_MS = 220;
const FILL_STEP_MS = 120;
const FAILSAFE_MS = 1540;
const REDUCED_HOLD_MS = 520;
const TYPE_START_MS = 280;

type Dir = (typeof DIRS)[number];
type Phase = 'enter' | 'typing' | 'ready' | 'exit';

const ROTATE: Record<Dir, number> = {
  up: 0,
  'up-right': 45,
  right: 90,
  down: 180,
  left: -90,
};

const MID_COL = (COLS - 1) / 2;
const MID_ROW = (ROWS - 1) / 2;

function chebyshev(row: number, col: number) {
  return Math.max(Math.abs(col - MID_COL), Math.abs(row - MID_ROW));
}

function compass(dx: number, dy: number): Dir {
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
}

function patternAt(frame: number, row: number, col: number): Dir | null {
  const dx = col - MID_COL;
  const dy = row - MID_ROW;
  const ring = chebyshev(row, col);
  const checker = (row + col) % 2;
  switch (frame % 12) {
    case 0:
      return row === Math.round(MID_ROW) || col === Math.round(MID_COL)
        ? compass(dx || 0, dy || -1)
        : null;
    case 1:
      return ring === 2 || ring === 4 ? compass(dx, dy) : null;
    case 2:
      return 'up';
    case 3:
      return Math.abs(dx - dy) < 0.8 ? 'up-right' : null;
    case 4:
      return ring === 0 ? null : compass(dx, dy);
    case 5:
      return row % 2 === 0 ? 'right' : null;
    case 6:
      return checker === 0 ? 'up' : 'down';
    case 7:
      return ring === 0 ? null : compass(-dx, -dy);
    case 8:
      if (!(row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1)) return null;
      return row === 0 ? 'right' : row === ROWS - 1 ? 'left' : col === 0 ? 'up' : 'down';
    case 9:
      return Math.abs(dx) === Math.round(dy) || Math.abs(dx) === Math.round(dy) + 1
        ? dy >= 0
          ? 'down'
          : 'up'
        : null;
    case 10:
      return col % 3 === frame % 3 ? 'down' : col % 3 === (frame + 1) % 3 ? 'up' : null;
    case 11:
      return (Math.abs(dx) + Math.abs(dy)) % 3 === 0 ? DIRS[(row + col) % DIRS.length] : null;
    default:
      return null;
  }
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function Arrow({ direction, className }: { direction: Dir; className?: string }) {
  return (
    <img
      src="/intro/arrow.png"
      className={className}
      style={{ transform: `rotate(${ROTATE[direction]}deg)` }}
      width={49}
      height={55}
      alt=""
      aria-hidden="true"
    />
  );
}

export default function AsciiIntro({ onComplete }: { onComplete: () => void }) {
  const reducedRef = useRef(prefersReducedMotion());
  const [typed, setTyped] = useState(reducedRef.current ? BRAND.length : 0);
  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState<Phase>(reducedRef.current ? 'ready' : 'enter');
  const exiting = useRef(false);
  const canSkip = useRef(reducedRef.current);
  const typedReady = useRef(reducedRef.current);
  const done = useRef(onComplete);
  done.current = onComplete;
  const lenis = useLenis();

  const cells = useMemo(() => {
    const list: { row: number; col: number; delay: string }[] = [];
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        list.push({ row, col, delay: `${chebyshev(row, col) * FILL_STEP_MS}ms` });
      }
    }
    return list;
  }, []);

  const exit = () => {
    if (!canSkip.current || !typedReady.current || exiting.current) return;
    exiting.current = true;
    setTyped(BRAND.length);
    setPhase('exit');
    window.setTimeout(() => done.current?.(), EXIT_MS);
  };

  const skipNow = () => {
    canSkip.current = true;
    typedReady.current = true;
    exit();
  };

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-cv-intro', 'on');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      html.removeAttribute('data-cv-intro');
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [lenis]);

  useEffect(() => {
    if (reducedRef.current) {
      setTyped(BRAND.length);
      setPhase('ready');
      canSkip.current = true;
      typedReady.current = true;
      const t = window.setTimeout(exit, REDUCED_HOLD_MS);
      return () => window.clearTimeout(t);
    }
    setPhase('typing');
    let n = 0;
    let stopped = false;
    const timers: number[] = [];
    const tick = () => {
      if (stopped) return;
      n += 1;
      setTyped(n);
      if (n < BRAND.length) {
        timers.push(window.setTimeout(tick, TYPE_MS));
        return;
      }
      setPhase('ready');
      timers.push(
        window.setTimeout(() => {
          canSkip.current = true;
          exit();
        }, READY_HOLD_MS)
      );
    };
    timers.push(window.setTimeout(tick, TYPE_START_MS));
    timers.push(
      window.setTimeout(() => {
        typedReady.current = true;
        exit();
      }, FAILSAFE_MS)
    );
    return () => {
      stopped = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
    // exit is stable enough via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reducedRef.current || phase === 'exit') return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % 12), PATTERN_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') skipNow();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const className = [
    'ascii-intro',
    phase === 'exit' ? 'ascii-intro--exit' : '',
    phase === 'enter' || phase === 'typing' ? 'ascii-intro--booting' : '',
    phase === 'ready' ? 'ascii-intro--ready' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      role="dialog"
      aria-modal="true"
      aria-label={BRAND}
      onClick={skipNow}
    >
      <div className="ascii-intro__glow" aria-hidden="true" />
      <div
        className="ascii-intro__field"
        aria-hidden="true"
        style={{ '--cols': COLS, '--rows': ROWS } as CSSProperties}
      >
        {cells.map(({ row, col, delay }) => {
          const dir = patternAt(frame, row, col);
          return (
            <span
              key={`${row}-${col}`}
              className="ascii-intro__cell"
              style={{ '--fill-delay': delay } as CSSProperties}
            >
              {dir ? <Arrow className="ascii-intro__arrow" direction={dir} /> : null}
            </span>
          );
        })}
      </div>
      <p className="ascii-intro__brand" aria-label={BRAND.slice(0, typed)}>
        {BRAND.split('').map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            className={`ascii-intro__letter${i < typed ? ' is-in' : ''}`}
            style={{ '--letter-i': i } as CSSProperties}
            aria-hidden="true"
          >
            {letter}
          </span>
        ))}
      </p>
    </div>
  );
}
