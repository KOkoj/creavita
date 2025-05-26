export interface GalleryImage { 
  _id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}

// Define fixed card dimensions for each viewport size to prevent layout shifts
export const CARD_DIMENSIONS = {
  xs: { width: '280px', height: '200px' },
  sm: { width: '280px', height: '200px' },
  md: { width: '280px', height: '200px' },
  lg: { width: '280px', height: '200px' }
}; 