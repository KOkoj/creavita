'use client';

import { useEffect, useRef } from 'react';
import SiteFrame, { useArrivalLock } from '@/components/chrome/SiteFrame';
import SiteHeader from '@/components/chrome/SiteHeader';
import HeroStage from './HeroStage';
import Statement from './Statement';
import WorkGallery from './WorkGallery';
import { useLenis } from '@/lib/lenis';
import { scrollToTarget } from '@/lib/scroll';

export default function HomeView() {
  const stageRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  useArrivalLock();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === '#top') return;
    const go = () => scrollToTarget(hash, lenis);
    const t = window.setTimeout(go, 80);
    window.addEventListener('hashchange', go);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('hashchange', go);
    };
  }, [lenis]);

  return (
    <SiteFrame variant="home" current="work" path="/">
      <div className="fold">
        <SiteHeader current="work" onMenu={() => window.dispatchEvent(new Event('site-menu-open'))} />
        <HeroStage
          stageRef={stageRef}
          nameRef={nameRef}
          onOpenContact={() => window.dispatchEvent(new Event('site-contact-open'))}
        />
      </div>
      <Statement infoRef={infoRef} />
      <WorkGallery />
    </SiteFrame>
  );
}
