'use client';

import HomeFooter from '@/components/HomeFooter';
import HomeHero from '@/components/HomeHero';
import ScrollGallerySection from '@/components/ScrollGallerySection';

export default function Home() {
  return (
    <div className="creavita-home">
      <a className="skip-link" href="#prace">
        Přeskočit na obsah
      </a>
      <HomeHero />
      <ScrollGallerySection />
      <HomeFooter />
    </div>
  );
}
