'use client';

import { useEffect } from 'react';
import { copy, MAILTO } from '@/lib/copy';
import { useLenis } from '@/lib/lenis';
import { usePathname, useRouter } from 'next/navigation';
import { scrollToTarget } from '@/lib/scroll';

export default function ContactMenu({
  id,
  open,
  onClose,
  triggerRef,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const lenis = useLenis();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (document.getElementById(id)?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDoc);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDoc);
    };
  }, [open, id, onClose, triggerRef]);

  const goBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    const home = path === '/' || path === '';
    if (home) {
      scrollToTarget('#rezervace', lenis);
      return;
    }
    router.push('/#rezervace');
  };

  return (
    <div
      id={id}
      className={open ? 'contact-menu is-open' : 'contact-menu'}
      role="menu"
      aria-label={`${copy.cta1} ${copy.cta2}`}
      {...(!open ? ({ inert: '' } as object) : {})}
    >
      <a role="menuitem" href={MAILTO} onClick={onClose}>
        {copy.writeEmail}
      </a>
      <a role="menuitem" href="/#rezervace" onClick={goBooking}>
        {copy.contact}
      </a>
    </div>
  );
}
