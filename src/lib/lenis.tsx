'use client';

import Lenis from 'lenis';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isTouch, prefersReducedMotion } from './motion';

gsap.registerPlugin(ScrollTrigger);

type LenisApi = Lenis | null;
const Ctx = createContext<LenisApi>(null);

export function useLenis() {
  return useContext(Ctx);
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<LenisApi>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) {
      setLenis(null);
      return;
    }
    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.12,
    });
    instance.on('scroll', ScrollTrigger.update);
    const ticker = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(ticker);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <Ctx.Provider value={lenis}>{children}</Ctx.Provider>;
}
