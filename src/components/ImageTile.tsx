'use client';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GalleryImage, CARD_DIMENSIONS } from '../models/gallery';

// Optimize image URL to use responsive sizes or WebP if available
const getOptimizedImageUrl = (url: string, width = 600, quality = 80): string => {
  // If using a service like Cloudinary, Imgix, or Next.js Image Optimization
  // we could transform the URL here to request an optimized version
  
  // Check if browser supports WebP
  const supportsWebP = typeof window !== 'undefined' && window.navigator.userAgent.indexOf('Chrome') > -1;
  const format = supportsWebP ? 'webp' : 'jpg';
  
  // Example simple optimization: add width and format params
  if (url.includes('?')) {
    return `${url}&w=${width}&q=${quality}&fmt=${format}`;
  }
  return `${url}?w=${width}&q=${quality}&fmt=${format}`;
};

// Generate a tiny thumbnail URL for blur-up effect
const getThumbnailUrl = (url: string): string => {
  // Create a very small, low quality version for blur-up placeholder
  return getOptimizedImageUrl(url, 20, 20);
};

interface ImageTileProps {
  img: GalleryImage | null;
  index: number;
  highlighted?: boolean;
}

const ImageTile = memo(({ img, index, highlighted = false }: ImageTileProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });
  
  // Image loaded tracking
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [showActions, setShowActions] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Load thumbnail early
  useEffect(() => {
    if (img && !thumbnailLoaded) {
      const thumbUrl = getThumbnailUrl(img.url);
      const tempImg = new Image();
      tempImg.onload = () => {
        setThumbnailUrl(thumbUrl);
        setThumbnailLoaded(true);
      };
      tempImg.src = thumbUrl;
    }
  }, [img, thumbnailLoaded]);
  
  // For measuring Core Web Vitals metrics
  useEffect(() => {
    // If this is an LCP candidate (one of the first visible images)
    if (index < 5 && imageRef.current) {
      // Register this as a potential LCP element
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Report to analytics if needed
            console.log('LCP element:', entry);
          });
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    }
  }, [index]);

  // Handle keyboard navigation for image caption
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = e.currentTarget;
      if (target.style.transform === 'translateY(0px)') {
        target.style.transform = 'translateY(100%)';
        setShowActions(false);
      } else {
        target.style.transform = 'translateY(0px)';
        setShowActions(true);
      }
    }
  }, []);

  // Handle image download
  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!img) return;
    
    // Create a hidden link and trigger download
    const link = document.createElement('a');
    link.href = img.url;
    link.download = `${img.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track download event
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'download_image', {
        image_id: img._id,
        image_title: img.title
      });
    }
  }, [img]);
  
  // Handle image share
  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!img) return;
    
    if (navigator.share) {
      navigator.share({
        title: img.title,
        text: img.description,
        url: img.url,
      })
      .then(() => {
        console.log('Shared successfully');
        // Track share event
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'share_image', {
            image_id: img._id,
            image_title: img.title
          });
        }
      })
      .catch(console.error);
    } else {
      // Fallback - copy link to clipboard
      navigator.clipboard.writeText(img.url).then(() => {
        alert('Image URL copied to clipboard!');
      });
    }
  }, [img]);

  // Placeholder for empty grid cells
  if (!img) {
    return (
      <motion.div
        key={`placeholder-${index}`}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: 'relative',
          width: CARD_DIMENSIONS.md.width,
          height: CARD_DIMENSIONS.md.height,
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          borderRadius: '2px'
        }}
        aria-hidden="true"
      >
        <div style={{ 
          width: '100%', 
          height: '100%', 
          background: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      key={img._id}
      layout
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
      }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.8,
        ease: "easeInOut"
      }}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        border: 'none',
        borderRadius: 0,
        outline: 'none',
        background: '#FFF',
      }}
      tabIndex={0}
      aria-label={`Image: ${img.title} - ${img.description}`}
    >
      {inView && (
        <>
          {/* Blur-up thumbnail while loading */}
          {thumbnailLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: imageLoaded ? 0 : 1,
                transition: 'opacity 0.6s ease',
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px)',
                transform: 'scale(1.05)',
              }}
            />
          )}
          
          {/* Loading skeleton if thumbnail not ready */}
          {!thumbnailLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: imageLoaded ? 0 : 1,
                transition: 'opacity 0.3s ease',
                background: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          )}
          
          {/* Main image */}
          <img
            ref={imageRef}
            src={getOptimizedImageUrl(img.url)}
            alt={img.title}
            loading={index < 5 ? "eager" : "lazy"}
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'opacity 0.6s ease',
              opacity: 0,
            }}
            onLoad={(e) => {
              // Fade in after load
              const target = e.currentTarget as HTMLImageElement;
              target.style.opacity = '1';
              setImageLoaded(true);
              
              // Report metrics to analytics
              if (index < 5 && 'performance' in window) {
                // This is a potential LCP image
                const now = performance.now();
                window.setTimeout(() => {
                  // Use requestIdleCallback if available
                  const report = () => {
                    // Report to analytics via sendBeacon
                    if (navigator.sendBeacon) {
                      const blob = new Blob([JSON.stringify({
                        metric: 'image-load',
                        url: img.url,
                        loadTime: now
                      })], { type: 'application/json' });
                      navigator.sendBeacon('/api/metrics', blob);
                    }
                  };
                  
                  if ('requestIdleCallback' in window) {
                    (window as any).requestIdleCallback(report);
                  } else {
                    report();
                  }
                }, 0);
              }
            }}
          />

          {/* Hover effect overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              opacity: 0,
              transition: 'opacity 300ms',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              color: 'white'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
            onFocus={e => e.currentTarget.style.opacity = '1'}
            onBlur={e => e.currentTarget.style.opacity = '0'}
          >
            <div>
              <h3 style={{ fontWeight: '700', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.title}</h3>
              <p style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.description}</p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
});

ImageTile.displayName = 'ImageTile';

export default ImageTile; 