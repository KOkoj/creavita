'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';

type NavId = 'work' | 'about' | 'contact';

const NAV = [
  { id: 'work' as const, label: 'NAŠE PRÁCE', href: '/#prace' },
  { id: 'about' as const, label: 'O NÁS', href: '/about/' },
  { id: 'contact' as const, label: 'KONTAKT', href: '/contact/' },
];

export default function SiteHeader({ current = 'work' }: { current?: NavId }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className={`site-header${open ? ' site-header--menu-open' : ''}`}>
      <Link href="/" className="logo" aria-label="CREAVITA — úvodní stránka">
        <img
          src="/creavita-logo.svg"
          className="logo__mark"
          alt="CREAVITA"
          width={138}
          height={20}
        />
      </Link>

      <div className="header-actions">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>
      </div>

      <nav
        id={menuId}
        className={`primary-nav${open ? ' primary-nav--open' : ''}`}
        aria-label="Hlavní navigace"
      >
        {NAV.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`primary-nav__link${
              current === item.id ? ' primary-nav__link--current' : ''
            }`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
