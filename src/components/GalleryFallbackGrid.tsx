import Link from 'next/link';
import type { GalleryItem } from '@/data/projects';

export default function GalleryFallbackGrid({
  items,
  title = 'Naše práce',
}: {
  items: GalleryItem[];
  title?: string;
}) {
  return (
    <div className="fallback-grid">
      <p className="fallback-grid__kicker">{title}</p>
      <ul className="fallback-grid__list">
        {items.map((item) => (
          <li key={`${item.slug}-${item.src}`}>
            <Link href={item.href} className="fallback-grid__card">
              <img src={item.src} alt={item.alt} width={640} height={640} />
              <span className="fallback-grid__meta">
                <span className="fallback-grid__client">{item.client}</span>
                <span className="fallback-grid__type">{item.type}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
