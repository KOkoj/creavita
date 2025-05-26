import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dynamic Image Gallery',
  description: 'Explore our curated collection of high-quality images across various categories',
  keywords: ['gallery', 'images', 'photography', 'art', 'responsive'],
  metadataBase: new URL('https://dynamic-gallery.example.com'),
  openGraph: {
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dynamic Image Gallery Preview'
      }
    ],
    type: 'website',
    title: 'Dynamic Image Gallery',
    description: 'Explore our curated collection of high-quality images across various categories',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dynamic Image Gallery',
    description: 'Explore our curated collection of high-quality images across various categories',
    images: ['/og-image.jpg'],
  }
}; 