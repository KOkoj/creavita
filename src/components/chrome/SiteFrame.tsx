'use client';

import { useEffect, useState } from 'react';
import { copy } from '@/lib/copy';
import CursorTip from './CursorTip';
import GroundColor from './GroundColor';
import ScrollRail from './ScrollRail';
import ContactFab from './ContactFab';
import SiteHeader from './SiteHeader';
import ScrollNav from './ScrollNav';
import MobilePanel from './MobilePanel';
import GridDebug from './GridDebug';
import { BookingEmpty, ClosingCompact, FooterBar } from '@/components/home/Closing';
import { isTouch, prefersReducedMotion } from '@/lib/motion';
import { useLenis } from '@/lib/lenis';

export type PageId = 'work' | 'about' | 'gallery' | 'contact';

export default function SiteFrame({
  variant,
  current,
  path,
  children,
  backHref,
  nextHref,
  nextLabel,
}: {
  variant: 'home' | 'page' | 'case';
  current?: PageId;
  path: string;
  children: React.ReactNode;
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  const [menu, setMenu] = useState(false);
  const home = variant === 'home';
  const parked = variant !== 'home';

  useEffect(() => {
    const open = () => setMenu(true);
    window.addEventListener('site-menu-open', open);
    return () => window.removeEventListener('site-menu-open', open);
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        {copy.skip}
      </a>
      {home ? <ArrivalFlood /> : null}
      {home ? <ScrollNav current={current} onMenu={() => setMenu(true)} /> : null}
      <div className="grain" aria-hidden="true" />
      <div className={variant === 'case' ? 'wrap is-case' : 'wrap'} id="top">
        <div className="guides" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        {home ? null : (
          <SiteHeader
            current={current}
            backHref={backHref}
            nextHref={nextHref}
            nextLabel={nextLabel}
            onMenu={() => setMenu(true)}
          />
        )}
        <main id="main" tabIndex={-1} data-path={path}>
          {children}
        </main>
        <div
          id="kontakt"
          className={home ? 'end-screen is-closing' : 'end-screen is-compact'}
        >
          {home ? <BookingEmpty /> : <ClosingCompact />}
          <FooterBar />
        </div>
      </div>
      <ContactFab parked={parked} />
      <ScrollRail />
      <CursorTip />
      <GridDebug />
      <MobilePanel open={menu} onClose={() => setMenu(false)} current={current} />
      <GroundColor />
      <CaseHeaderScroll />
      {home ? null : <InnerFabOff />}
    </>
  );
}

function ArrivalFlood() {
  useEffect(() => {
    const html = document.documentElement;
    if (prefersReducedMotion() || sessionStorage.getItem('cv-arrived')) {
      html.removeAttribute('data-arrival');
      return;
    }
    html.setAttribute('data-arrival', 'on');
  }, []);
  return (
    <div className="flood" aria-hidden="true">
      <span />
    </div>
  );
}

function CaseHeaderScroll() {
  useEffect(() => {
    const wrap = document.querySelector('.wrap.is-case');
    if (!wrap) return;
    const onScroll = () => wrap.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}

function InnerFabOff() {
  const lenis = useLenis();
  useEffect(() => {
    const el = document.getElementById('kontakt');
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      document.documentElement.classList.toggle('is-fab-off', entry.isIntersecting);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      document.documentElement.classList.remove('is-fab-off');
    };
  }, [lenis]);
  return null;
}

export function useArrivalLock() {
  const lenis = useLenis();
  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) return;
    const fold = document.querySelector('.fold');
    if (fold?.classList.contains('is-settled')) return;
    const html = document.documentElement;
    const body = document.body;
    const prevH = html.style.overflow;
    const prevB = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    lenis?.stop();
    const blockWheel = (e: Event) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key))
        e.preventDefault();
    };
    window.addEventListener('wheel', blockWheel, { passive: false });
    window.addEventListener('touchmove', blockWheel, { passive: false });
    window.addEventListener('keydown', blockKey);
    const release = () => {
      html.style.overflow = prevH;
      body.style.overflow = prevB;
      lenis?.start();
      window.removeEventListener('wheel', blockWheel);
      window.removeEventListener('touchmove', blockWheel);
      window.removeEventListener('keydown', blockKey);
      sessionStorage.setItem('cv-arrived', '1');
    };
    const mo = new MutationObserver(() => {
      if (fold?.classList.contains('is-settled') || fold?.classList.contains('is-shown')) {
        if (fold.classList.contains('is-settled')) {
          mo.disconnect();
          release();
        }
      }
    });
    if (fold) mo.observe(fold, { attributes: true, attributeFilter: ['class'] });
    const t = window.setTimeout(release, 2200);
    return () => {
      window.clearTimeout(t);
      mo.disconnect();
      release();
    };
  }, [lenis]);
}
