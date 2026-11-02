'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import NavLinks from './NavLinks';
import { copy, MAILTO } from '@/lib/copy';
import { useLenis } from '@/lib/lenis';

export default function MobilePanel({
  open,
  onClose,
  current,
}: {
  open: boolean;
  onClose: () => void;
  current?: 'work' | 'about' | 'gallery' | 'contact';
}) {
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevH = html.style.overflow;
    const prevB = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    const raf = requestAnimationFrame(() =>
      (root.current?.querySelector('.mobile-nav a') as HTMLElement | null)?.focus()
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      html.style.overflow = prevH;
      document.body.style.overflow = prevB;
      lenis?.start();
      window.removeEventListener('keydown', onKey);
      (document.querySelector('header .menu-btn') as HTMLElement | null)?.focus({
        preventScroll: true,
      });
    };
  }, [open, lenis, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={open ? 'mobile-panel is-open' : 'mobile-panel'}
      id="site-menu"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={copy.navLabel}
      aria-hidden={!open || undefined}
      {...(!open ? ({ inert: '' } as object) : {})}
    >
      <button
        type="button"
        className="text-btn menu-btn mobile-close"
        aria-label={copy.closeMenu}
        onClick={onClose}
      >
        <span className="burger" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      <nav className="mobile-nav" aria-label={copy.navLabel}>
        <NavLinks current={current} onNavigate={onClose} />
      </nav>
      <div className="mobile-foot mono">
        <p>
          <a href={MAILTO}>{copy.writeEmail}</a>
        </p>
      </div>
    </div>,
    document.body
  );
}
