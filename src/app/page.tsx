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

// Static sample images for gallery
const STATIC_IMAGES: GalleryImage[] = [
  {
    _id: '1',
    title: 'Mountain Landscape',
    description: 'Beautiful mountain view at sunset with vibrant colors',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '2',
    title: 'Urban Architecture',
    description: 'Modern city buildings with unique architectural design',
    category: 'Urban',
    url: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '3',
    title: 'Beach Sunset',
    description: 'Golden sunset over calm ocean waters',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '4',
    title: 'Wildlife Photography',
    description: 'Majestic lion resting in the savanna',
    category: 'Animals',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '5',
    title: 'Abstract Art',
    description: 'Colorful abstract painting with dynamic shapes',
    category: 'Art',
    url: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '6',
    title: 'Food Photography',
    description: 'Delicious healthy breakfast with fruits and pastries',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '7',
    title: 'Street Photography',
    description: 'Busy urban street scene with people walking',
    category: 'Urban',
    url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '8',
    title: 'Forest Path',
    description: 'Mystical forest path with morning fog',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '9',
    title: 'Travel Photography',
    description: 'Ancient temple ruins at sunset',
    category: 'Travel',
    url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '10',
    title: 'Sports Action',
    description: 'Extreme sports athlete performing tricks',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '11',
    title: 'Portrait Photography',
    description: 'Close-up portrait with dramatic lighting',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '12',
    title: 'Technology',
    description: 'Modern workspace with high-tech devices',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '13',
    title: 'Minimalist Design',
    description: 'Simple and elegant minimalist interior design',
    category: 'Design',
    url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '14',
    title: 'Night Sky',
    description: 'Milky Way galaxy over mountain landscape',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '15',
    title: 'Fashion Photography',
    description: 'High fashion model in urban environment',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '16',
    title: 'Architecture Detail',
    description: 'Geometric patterns in modern architecture',
    category: 'Urban',
    url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '17',
    title: 'Ocean Wave',
    description: 'Powerful ocean wave crashing against rocks',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '18',
    title: 'Vintage Car',
    description: 'Classic vintage automobile in pristine condition',
    category: 'Vintage',
    url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
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