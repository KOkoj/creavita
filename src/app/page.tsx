'use client';
import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import Head from 'next/head';
// Define GalleryImage interface locally
interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}
import SharedLayout from '@/components/SharedLayout';

// Lazy load the Gallery component for better performance
const Gallery = lazy(() => import('@/components/Gallery'));

// Loading fallback component with matching dimensions
const GalleryLoadingFallback = () => (
  <div 
    style={{ 
      height: '600px', 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
      padding: '0 16px'
    }}
    aria-label="Loading gallery"
    role="status"
  >
    {Array(15).fill(0).map((_, i) => (
      <div 
        key={i} 
        style={{ 
          backgroundColor: '#fff',
          height: '180px', 
          borderRadius: '4px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          opacity: 0.5 + (Math.random() * 0.3)
        }} 
      />
    ))}
    <style jsx>{`
      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.8; }
      }
    `}</style>
  </div>
);

// Static images from your uploads folder
const STATIC_IMAGES: GalleryImage[] = [
  {
    _id: '1',
    title: 'Design Project Y-01',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011167-y-01.jpg'
  },
  {
    _id: '2',
    title: 'Design Project Y-02',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011170-y-02.jpg'
  },
  {
    _id: '3',
    title: 'Design Project Y-03',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011173-y-03.jpg'
  },
  {
    _id: '4',
    title: 'Design Project Y-04',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011176-y-04.jpg'
  },
  {
    _id: '5',
    title: 'Design Project Y-05',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011179-y-05.jpg'
  },
  {
    _id: '6',
    title: 'Design Project Y-06',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011182-y-06.jpg'
  },
  {
    _id: '7',
    title: 'Design Project Y-07',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011185-y-07.jpg'
  },
  {
    _id: '8',
    title: 'Design Project Y-08',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011188-y-08.jpg'
  },
  {
    _id: '9',
    title: 'Design Project Y-09',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011192-y-09.jpg'
  },
  {
    _id: '10',
    title: 'Design Project Y-10',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011195-y-10.jpg'
  },
  {
    _id: '11',
    title: 'Design Project X-01',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011102-x-01.jpg'
  },
  {
    _id: '12',
    title: 'Design Project X-02',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011112-x-02.jpg'
  },
  {
    _id: '13',
    title: 'Design Project X-03',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011117-x-03.jpg'
  },
  {
    _id: '14',
    title: 'Design Project X-04',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011122-x-04.jpg'
  },
  {
    _id: '15',
    title: 'Design Project X-05',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011126-x-05.jpg'
  },
  {
    _id: '16',
    title: 'Design Project X-06',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011129-x-06.jpg'
  },
  {
    _id: '17',
    title: 'Design Project X-07',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011133-x-07.jpg'
  },
  {
    _id: '18',
    title: 'Design Project X-08',
    description: 'Creative design work from series X',
    category: 'LOGA',
    url: '/uploads/1747314011137-x-08.jpg'
  },
  {
    _id: '19',
    title: 'Design Project X-09',
    description: 'Creative design work from series X',
    category: 'POS',
    url: '/uploads/1747314011142-x-09.jpg'
  },
  {
    _id: '20',
    title: 'Design Project X-10',
    description: 'Creative design work from series X',
    category: 'POS',
    url: '/uploads/1747314011146-x-10.jpg'
  },
  {
    _id: '21',
    title: 'Design Project X-11',
    description: 'Creative design work from series X',
    category: 'POS',
    url: '/uploads/1747314011149-x-11.jpg'
  },
  {
    _id: '22',
    title: 'Design Project X-12',
    description: 'Creative design work from series X',
    category: 'OBALY',
    url: '/uploads/1747314011154-x-12.jpg'
  },
  {
    _id: '23',
    title: 'Design Project X-13',
    description: 'Creative design work from series X',
    category: 'OBALY',
    url: '/uploads/1747314011157-x-13.jpg'
  },
  {
    _id: '24',
    title: 'Design Project X-14',
    description: 'Creative design work from series X',
    category: 'OBALY',
    url: '/uploads/1747314011160-x-14.jpg'
  },
  {
    _id: '25',
    title: 'Design Project X-15',
    description: 'Creative design work from series X',
    category: 'MIRROR DESIGN',
    url: '/uploads/1747314011164-x-15.jpg'
  },
  {
    _id: '26',
    title: 'Design Project Y-11',
    description: 'Creative design work from series Y',
    category: 'MIRROR DESIGN',
    url: '/uploads/1747314011199-y-11.jpg'
  },
  {
    _id: '27',
    title: 'Design Project Y-12',
    description: 'Creative design work from series Y',
    category: 'MIRROR DESIGN',
    url: '/uploads/1747314011202-y-12.jpg'
  },
  {
    _id: '28',
    title: 'Design Project Y-13',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011206-y-13.jpg'
  },
  {
    _id: '29',
    title: 'Design Project Y-14',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011209-y-14.jpg'
  },
  {
    _id: '30',
    title: 'Design Project Y-15',
    description: 'Creative design work from series Y',
    category: 'VIZUÁLNÍ STYL',
    url: '/uploads/1747314011212-y-15.jpg'
  }
];

// Optimize for Core Web Vitals
const preconnectToImageDomains = () => {
  return (
    <>
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
    </>
  );
};

export default function Home() {
  const [images, setImages] = useState<GalleryImage[]>(STATIC_IMAGES);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>(STATIC_IMAGES);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize categories on component mount
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(STATIC_IMAGES.map((img) => img.category))) as string[];
    setCategories(uniqueCategories);
    setIsLoading(false);
  }, []);

  // Filter images when category or search query changes
  useEffect(() => {
    console.log('Filter effect running. Category:', activeCategory, 'Search:', searchQuery);
    
    let result = [...images];
    
    // Apply category filter
    if (activeCategory !== 'All') {
      result = result.filter(img => img.category === activeCategory);
    }
    
    // Apply search filter if we have a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(img => 
        img.title.toLowerCase().includes(query) || 
        img.description.toLowerCase().includes(query) ||
        img.category.toLowerCase().includes(query)
      );
    }
    
    console.log(`After filtering: ${result.length} images`);
    setFilteredImages(result);
    
    // Track search for analytics
    if (searchQuery.trim() && typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'search', {
        search_term: searchQuery
      });
    }
  }, [images, activeCategory, searchQuery]);

  // Separate effect for shuffle
  useEffect(() => {
    if (shuffleCount > 0) {
      console.log('Shuffle effect running');
      setFilteredImages(prev => {
        console.log('Shuffling', prev.length, 'images');
        return [...prev].sort(() => Math.random() - 0.5);
      });
    }
  }, [shuffleCount]);

  // Memoize categories to avoid unnecessary re-renders
  const uniqueCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setActiveCategory(category);
  };

  const handleSearchChange = (query: string) => {
    console.log('Search query changed to:', query);
    setSearchQuery(query);
  };

  const handleShuffle = () => {
    console.log('Shuffle triggered');
    setShuffleCount(prev => prev + 1);
  };

  return (
    <>
      <Head>
        <title>Dynamic Image Gallery</title>
        <meta name="description" content="A beautiful, responsive image gallery with dynamic filtering and animations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {preconnectToImageDomains()}
      </Head>

      <SharedLayout 
        onCategoryChange={handleCategoryChange} 
        activeCategory={activeCategory}
      >
        <Suspense fallback={<GalleryLoadingFallback />}>
          <Gallery images={filteredImages} />
        </Suspense>
      </SharedLayout>
    </>
  );
} 