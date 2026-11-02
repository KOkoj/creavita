'use client';

import Mark from './Mark';
import NavLinks from './NavLinks';
import { copy } from '@/lib/copy';

export default function SiteHeader({
  current,
  backHref = '/',
  nextHref,
  nextLabel,
  onMenu,
}: {
  current?: 'work' | 'about' | 'gallery' | 'contact';
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
  onMenu: () => void;
}) {
  const inner = current !== 'work';
  return (
    <header>
      <div className="brand">
        <Mark />
        {inner ? (
          <a className="page-back mono" href={backHref}>
            {copy.back}
          </a>
        ) : null}
        {nextHref ? (
          <a className="page-back page-next mono" href={nextHref}>
            {nextLabel ?? copy.nextProject}
          </a>
        ) : null}
      </div>
      <nav className="desk-nav mono" aria-label={copy.navLabel}>
        <NavLinks current={current} />
      </nav>
      <div className="r mono">
        <button
          type="button"
          className="text-btn menu-btn"
          aria-expanded="false"
          aria-controls="site-menu"
          aria-label={copy.openMenu}
          data-cursor-label={copy.openMenu}
          onClick={onMenu}
        >
          <span className="burger" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
    </header>
  );
}
