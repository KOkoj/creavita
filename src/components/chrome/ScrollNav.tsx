'use client';

import { useEffect, useState } from 'react';
import Mark from './Mark';
import NavLinks from './NavLinks';
import { copy } from '@/lib/copy';
import { isTouch } from '@/lib/motion';

export default function ScrollNav({
  current,
  onMenu,
}: {
  current?: 'work' | 'about' | 'gallery' | 'contact';
  onMenu: () => void;
}) {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState(false);

  useEffect(() => {
    const tick = () => {
      const fold = document.querySelector('.fold') as HTMLElement | null;
      const y = window.scrollY;
      const past = fold ? fold.getBoundingClientRect().bottom < 48 : y > 80;
      setOn(past);
      const sg = document.querySelector('.sg');
      const mid = window.innerHeight / 2;
      const inProjects = !!(
        sg &&
        sg.getBoundingClientRect().top <= mid &&
        sg.getBoundingClientRect().bottom >= mid
      );
      setProjects(inProjects);
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
    };
  }, []);

  const cls = [
    'scroll-nav',
    on ? 'is-on' : '',
    open ? 'is-open' : '',
    projects ? 'is-projects' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      onMouseEnter={() => {
        if (!isTouch()) setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <Mark />
      <button
        type="button"
        className="text-btn menu-btn scroll-menu"
        aria-label={copy.openMenu}
        aria-controls="site-menu"
        aria-expanded="false"
        onClick={onMenu}
      >
        <span className="burger" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      <div className="scroll-nav-rest mono" {...(!open ? ({ inert: '' } as object) : {})}>
        <nav aria-label={copy.navLabel}>
          <NavLinks current={current} />
        </nav>
      </div>
    </div>
  );
}
