import GalleryView from '@/components/gallery/GalleryView';
import { copy } from '@/lib/copy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${copy.gallery} — CREAVITA`,
  description: copy.selectedWork,
};

export default function Page() {
  return <GalleryView />;
}
