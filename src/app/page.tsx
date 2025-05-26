'use client';
import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import Head from 'next/head';
import { GalleryImage } from '@/models/gallery';
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

// Sample image data for demonstration
const SAMPLE_IMAGES = [
  {
    _id: '1',
    title: 'Mountain Landscape',
    description: 'Beautiful mountain view at sunset with vibrant colors',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3'
  },
  {
    _id: '2',
    title: 'Urban Architecture',
    description: 'Modern city buildings with unique architectural design',
    category: 'Urban',
    url: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-4.0.3'
  },
  {
    _id: '3',
    title: 'Beach Sunset',
    description: 'Golden sunset over calm ocean waters',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3'
  },
  {
    _id: '4',
    title: 'Wildlife Photography',
    description: 'Majestic lion resting in the savanna',
    category: 'Animals',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3'
  },
  {
    _id: '5',
    title: 'Abstract Art',
    description: 'Colorful abstract painting with dynamic shapes',
    category: 'Art',
    url: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?ixlib=rb-4.0.3'
  },
  {
    _id: '6',
    title: 'Food Photography',
    description: 'Delicious healthy breakfast with fruits and pastries',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3'
  },
  {
    _id: '7',
    title: 'Street Photography',
    description: 'Busy urban street scene with people walking',
    category: 'Urban',
    url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3'
  },
  {
    _id: '8',
    title: 'Forest Path',
    description: 'Mystical forest path with morning fog',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3'
  },
  {
    _id: '9',
    title: 'Travel Photography',
    description: 'Ancient temple ruins at sunset',
    category: 'Travel',
    url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3'
  },
  {
    _id: '10',
    title: 'Sports Action',
    description: 'Extreme sports athlete performing tricks',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?ixlib=rb-4.0.3'
  },
  {
    _id: '11',
    title: 'Portrait Photography',
    description: 'Close-up portrait with dramatic lighting',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3'
  },
  {
    _id: '12',
    title: 'Technology',
    description: 'Modern workspace with high-tech devices',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3'
  },
  {
    _id: '13',
    title: 'Minimalist Design',
    description: 'Simple and elegant minimalist interior design',
    category: 'Design',
    url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?ixlib=rb-4.0.3'
  },
  {
    _id: '14',
    title: 'Night Sky',
    description: 'Milky Way galaxy over mountain landscape',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3'
  },
  {
    _id: '15',
    title: 'Fashion Photography',
    description: 'High fashion model in urban environment',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3'
  }
];

// Optimize for Core Web Vitals
const preconnectToImageDomains = () => {
  // Preconnect to domains where images are hosted to improve loading time
  return (
    <>
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
    </>
  );
};

export default function Home() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch images only once on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Filter images when category or search query changes
  useEffect(() => {
    console.log('Filter effect running. Category:', activeCategory, 'Search:', searchQuery);
    
    if (!images.length) return; // Don't run if no images loaded yet
    
    let result = [...images]; // Start with fresh copy of images
    
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
    
    // Always reset the filtered images to avoid accumulation
    setFilteredImages(result);
    
    // Track search for analytics
    if (searchQuery.trim() && typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'search', {
        search_term: searchQuery
      });
    }
  }, [images, activeCategory, searchQuery]); // Only re-run if these values change

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

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching images from API...');
      
      // Use fetch to get images from our API endpoint
      const response = await fetch('/api/images');
      
      // If fetch fails, throw an error
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      // If no images from API yet, use sample images
      if (!data || data.length === 0) {
        console.log('No images found in database, using sample images');
        setImages(SAMPLE_IMAGES);
        setFilteredImages(SAMPLE_IMAGES);
        const uniqueCategories = Array.from(new Set(SAMPLE_IMAGES.map((img) => img.category))) as string[];
        setCategories(uniqueCategories);
      } else {
        console.log('Images loaded from API:', data.length);
        
        // Map API data to match GalleryImage interface
        const formattedData = data.map((img: any) => ({
          _id: img._id,
          title: img.title,
          description: img.description,
          category: img.category,
          url: img.url.startsWith('http') ? img.url : `${window.location.origin}${img.url}`
        }));
        
        setImages(formattedData);
        setFilteredImages(formattedData);
        const uniqueCategories = Array.from(new Set(formattedData.map((img: GalleryImage) => img.category))) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images from API. Using sample images instead.');
      
      // Fallback to sample images on error
      setImages(SAMPLE_IMAGES);
      setFilteredImages(SAMPLE_IMAGES);
      const uniqueCategories = Array.from(new Set(SAMPLE_IMAGES.map((img) => img.category))) as string[];
      setCategories(uniqueCategories);
    } finally {
      setIsLoading(false);
      console.log('Loading state set to false');
    }
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category change:', category);
    
    if (category === 'Shuffle') {
      // Just increment shuffle counter, effect will handle it
      setShuffleCount(prev => prev + 1);
      return;
    }
    
    // Just update the category, the useEffect will handle filtering
    setActiveCategory(category);
    
    // For analytics - track category changes
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'category_change', {
        category_name: category
      });
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    setSearchQuery(query);
  };

  // Memoize the loading state to avoid unnecessary renders
  const loadingView = useMemo(() => (
    <SharedLayout onCategoryChange={handleCategoryChange} activeCategory={activeCategory}>
      <div 
        role="status" 
        aria-live="polite" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '60vh',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '1.5rem',
              height: '1.5rem',
              border: '0.25rem solid #e2e8f0',
              borderTop: '0.25rem solid #F9A01B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '0.75rem'
            }}
          />
          <span>Loading gallery...</span>
        </div>
        <button 
          onClick={fetchImages} 
          style={{
            fontSize: '14px',
            padding: '8px 16px',
            backgroundColor: '#F9A01B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px',
            display: error ? 'block' : 'none'
          }}
        >
          Try Again
        </button>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg) }
          }
        `}</style>
      </div>
    </SharedLayout>
  ), [error, activeCategory, handleCategoryChange]);

  if (isLoading) {
    return loadingView;
  }

  return (
    <>
      <Head>
        <meta name="description" content="Explore our beautiful image gallery with high-quality photographs" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Dynamic Image Gallery${activeCategory !== 'All' ? ` - ${activeCategory}` : ''}`} />
        <meta property="og:description" content="Explore our beautiful image gallery with high-quality photographs" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Dynamic Image Gallery${activeCategory !== 'All' ? ` - ${activeCategory}` : ''}`} />
        <meta name="twitter:description" content="Explore our beautiful image gallery with high-quality photographs" />
        <meta name="twitter:image" content="/og-image.jpg" />
        {preconnectToImageDomains()}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <SharedLayout onCategoryChange={handleCategoryChange} activeCategory={activeCategory}>
        <section 
          aria-label={`Gallery Images ${activeCategory !== 'All' ? `filtered by ${activeCategory}` : ''}${searchQuery ? ` search results for "${searchQuery}"` : ''}`}
        >
          <Suspense fallback={<GalleryLoadingFallback />}>
            <Gallery images={filteredImages} />
          </Suspense>
        </section>
        
        {filteredImages.length === 0 && (
          <p 
            style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}
            aria-live="polite"
          >
            {searchQuery 
              ? `No images found matching "${searchQuery}". Try another search term or category.`
              : 'No images found in this category. Please try another category.'}
          </p>
        )}
      </SharedLayout>
    </>
  );
} 