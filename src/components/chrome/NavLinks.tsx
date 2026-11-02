'use client';

import Link from 'next/link';
import { NAV } from '@/lib/copy';
import { projects } from '@/data/projects';
import { copy } from '@/lib/copy';

export default function NavLinks({
  current,
  onNavigate,
}: {
  current?: 'work' | 'about' | 'gallery' | 'contact';
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.id}
          className={current === item.id ? 'on' : undefined}
          href={item.href}
          aria-current={current === item.id ? 'page' : undefined}
          onClick={onNavigate}
        >
          {item.label}
          {item.count ? ` (${projects.length})` : ''}
        </Link>
      ))}
    </>
  );
}

export function WorkCountLabel() {
  return (
    <>
      {copy.work} ({projects.length})
    </>
  );
}
