'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import ImageTile from './ImageTile';
// Define GalleryImage interface locally
interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}

// Fixed dimensions
const IMAGE_WIDTH = 280;
const IMAGE_HEIGHT = 200;
const GAP = 4;
const SAFETY_MARGIN = 40; // Safety margin to prevent cutoff

// Exact breakpoint as specified
const MAIN_BREAKPOINT = 1440;

// Simple direct breakpoints with column counts
const BREAKPOINTS = [
  { width: 500, columns: 1 },   // 0-500px: 1 column
  { width: 900, columns: 2 },   // 500-900px: 2 columns  
  { width: 1024, columns: 3 },  // 900-1024px: 3 columns
  { width: 1440, columns: 4 },  // 1024-1440px: 4 columns
  { width: Infinity, columns: 5 } // 1440px+: 5 columns
];

// The main Gallery component
const Gallery = ({ images }: { images: GalleryImage[] }) => {
  // State for the current grid of 15 images
  const [gridImages, setGridImages] = useState<(GalleryImage | null)[]>([]);
  // State for the highlighted image index
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  // Track window width for responsive behavior
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : MAIN_BREAKPOINT
  );

  // Get columns based on window width using direct breakpoints
  const columns = useMemo(() => {
    for (const breakpoint of BREAKPOINTS) {
      if (windowWidth < breakpoint.width) {
        return breakpoint.columns;
      }
    }
    return 5; // Default to 5 columns
  }, [windowWidth]);

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize gridImages when images change
  useEffect(() => {
    const result = Array(15).fill(null);
    const displayed = images.slice(0, 15);
    displayed.forEach((img, i) => {
      result[i] = img;
    });
    setGridImages(result);
  }, [images]);

  // Swapping/highlight effect
  useEffect(() => {
    if (!gridImages.length || gridImages.every(img => !img)) return;
    const interval = setInterval(() => {
      // Pick a random index with an image
      const validIndexes = gridImages.map((img, i) => img ? i : null).filter(i => i !== null) as number[];
      if (validIndexes.length === 0) return;
      const idx = validIndexes[Math.floor(Math.random() * validIndexes.length)];
      setHighlightedIndex(idx);

      // Fade duration 800ms
      const timeout = setTimeout(() => {
        const current = gridImages[idx];
        if (!current) {
          setHighlightedIndex(null);
          return;
        }
        // Find candidates from the same category not in grid
        const gridIds = new Set(gridImages.filter(Boolean).map(img => (img as GalleryImage)._id));
        const pool = images.filter(
          img => img.category === current.category && !gridIds.has(img._id)
        );
        if (pool.length > 0) {
          const replacement = pool[Math.floor(Math.random() * pool.length)];
          setGridImages(g => {
            const newGrid = [...g];
            newGrid[idx] = replacement;
            return newGrid;
          });
        }
        setHighlightedIndex(null);
      }, 800);
      return () => clearTimeout(timeout);
    }, 500); // swap every 500 milliseconds
    return () => clearInterval(interval);
  }, [gridImages, images]);

  // Calculate rows based on columns
  const rows = Math.ceil(15 / columns);

  // Calculate gallery width safely
  const totalGalleryWidth = columns * IMAGE_WIDTH + (columns - 1) * GAP;
  
  // Ensure gallery width doesn't exceed window width
  const safeGalleryWidth = Math.min(totalGalleryWidth, windowWidth - SAFETY_MARGIN);

  // Debug info - can be removed in production
  console.log(`Window width: ${windowWidth}, Columns: ${columns}, Rows: ${rows}, Gallery width: ${safeGalleryWidth}px`);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden', // Prevent any horizontal scroll
    }}>
      <div style={{
        width: safeGalleryWidth,
        maxWidth: '100%', // Extra safety
        overflow: 'hidden', // Extra safety
        margin: '0 auto',
      }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, ${IMAGE_WIDTH}px))`,
            gap: GAP,
            width: '100%',
            justifyContent: 'center',
          }}
          role="grid"
          aria-rowcount={rows}
          aria-colcount={columns}
        >
          {gridImages.map((img, i) => (
            <div
              key={i}
              role="gridcell"
              aria-rowindex={Math.floor(i / columns) + 1}
              aria-colindex={(i % columns) + 1}
              style={{
                position: 'relative',
                width: '100%',
                height: IMAGE_HEIGHT,
                background: '#f3f4f6',
                borderRadius: 0,
                outline: 'none',
                border: 'none',
                overflow: 'hidden',
              }}
            >
              <ImageTile 
                img={img} 
                index={i} 
                highlighted={highlightedIndex === i} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(Gallery); 