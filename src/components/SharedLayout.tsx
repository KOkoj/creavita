'use client';
import { useState, useEffect, Fragment } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// Navigation menu styling and rendering
const navItemStyle = {
  color: '#000',
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: 'normal',
  margin: '0 12px',
  cursor: 'pointer',
  textDecoration: 'none',
  position: 'relative' as 'relative',
  transition: 'opacity 0.2s ease',
};

const separatorStyle = {
  color: '#F9A01B', // Orange color
  margin: '0 8px',
  fontWeight: 'bold',
};

// Define main navigation items
const navigationItems = [
  { type: 'page', label: 'O NÁS', href: '/about' },
  { type: 'filter', label: 'LOGA', category: 'LOGA' },
  { type: 'filter', label: 'VIZUÁLNÍ STYL', category: 'VIZUÁLNÍ STYL' },
  { type: 'filter', label: 'POS', category: 'POS' },
  { type: 'filter', label: 'OBALY', category: 'OBALY' },
  { type: 'filter', label: 'MIRROR DESIGN', category: 'MIRROR DESIGN' },
  { type: 'page', label: 'EVENTY', href: '/events' },
  { type: 'page', label: 'KONTAKT', href: '/contact' },
];

interface SharedLayoutProps {
  children: React.ReactNode;
  onCategoryChange?: (category: string) => void;
  activeCategory?: string;
}

export default function SharedLayout({ 
  children, 
  onCategoryChange,
  activeCategory = 'All'
}: SharedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      // If we're not on the home page, navigate to home with the category
      if (pathname !== '/') {
        router.push(`/?category=${category}`);
      }
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div role="main" style={{ 
      width: '100%', 
      maxWidth: '100vw', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* Header & Navigation Bar */}
      <header style={{ 
        padding: '15px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        marginTop: '20px',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          position: 'relative'
        }}>
          {/* Logo */}
          <Link href="/" style={{ 
            textDecoration: 'none', 
            display: 'inline-block',
            flexShrink: 0
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="78" viewBox="0 0 183 119" fill="none">
              <g clipPath="url(#clip0_5_45)">
                <path d="M113.64 42.51C113.71 42.38 113.82 42.22 113.99 42.03C114.16 41.85 114.41 41.75 114.74 41.75H115.79C116.06 41.75 116.29 41.85 116.49 42.05C116.69 42.25 116.79 42.48 116.79 42.75C116.79 42.92 116.76 43.1 116.69 43.3L105.06 75.64C104.76 76.44 104.19 76.84 103.36 76.84H98.76C97.93 76.84 97.36 76.44 97.06 75.64L85.43 43.3C85.36 43.1 85.33 42.92 85.33 42.75C85.33 42.48 85.43 42.25 85.63 42.05C85.83 41.85 86.06 41.75 86.33 41.75H87.38C87.71 41.75 87.97 41.84 88.13 42.03C88.3 42.21 88.41 42.37 88.48 42.51L99.47 73.2H102.86L113.65 42.51H113.64Z" fill="#4D4D4D"/>
                <path d="M143.45 83.02C144.22 83.02 144.6 83.4 144.6 84.17V84.92C144.6 85.66 144.22 86.02 143.45 86.02H133.57V117.01C133.57 117.75 133.19 118.11 132.42 118.11H131.52C130.78 118.11 130.42 117.74 130.42 117.01V86.02H120.49C119.75 86.02 119.39 85.65 119.39 84.92V84.17C119.39 83.4 119.76 83.02 120.49 83.02H143.46H143.45Z" fill="#4D4D4D"/>
                <path d="M133.07 41.76H132.11C131.503 41.76 131.01 42.2525 131.01 42.86V75.76C131.01 76.3675 131.503 76.86 132.11 76.86H133.07C133.678 76.86 134.17 76.3675 134.17 75.76V42.86C134.17 42.2525 133.678 41.76 133.07 41.76Z" fill="#4D4D4D"/>
                <path d="M105.09 32.59C105.86 32.59 106.24 32.97 106.24 33.74V34.49C106.24 35.23 105.86 35.59 105.09 35.59H85.13C84.39 35.59 84.03 35.22 84.03 34.49V1.66001C84.03 0.89001 84.4 0.51001 85.13 0.51001H104.69C105.46 0.51001 105.84 0.89001 105.84 1.66001V2.41001C105.84 3.15001 105.46 3.51001 104.69 3.51001H87.19V32.59H105.09Z" fill="#4D4D4D"/>
                <path d="M55.39 0.5C58.9 0.5 61.7 1.34 63.79 3.01C65.88 4.68 66.92 7.22 66.92 10.63C66.92 13.34 66.26 15.49 64.94 17.07C63.62 18.66 61.76 19.74 59.35 20.3L67.42 34.04C67.52 34.24 67.57 34.42 67.57 34.59C67.57 34.86 67.47 35.09 67.27 35.29C67.07 35.49 66.84 35.59 66.57 35.59H65.97C65.4 35.59 64.99 35.46 64.74 35.19C64.49 34.92 64.26 34.61 64.06 34.24L56.09 20.75C55.25 19.24 55.68 17.78 56.31 17.71C61.28 17.4 63.76 15.04 63.76 10.62C63.76 5.87 60.89 3.5 55.14 3.5H45.76V34.49C45.76 35.23 45.38 35.59 44.61 35.59H43.71C42.97 35.59 42.61 35.22 42.61 34.49V1.66C42.61 0.89 42.98 0.51 43.71 0.51H55.39V0.5Z" fill="#4D4D4D"/>
                <path d="M3.26 13.84C3.16 16.61 3.16 19.42 3.26 22.26C3.39 26.07 4.35 28.83 6.12 30.53C7.89 32.23 10.32 33.09 13.39 33.09C14.73 33.09 15.96 32.96 17.08 32.71C18.2 32.46 19.19 32.03 20.04 31.43C20.89 30.83 21.62 30.03 22.22 29.05C22.82 28.06 23.29 26.82 23.62 25.31C23.69 24.91 23.82 24.63 24.02 24.48C24.22 24.33 24.45 24.25 24.72 24.25H25.72C26.02 24.25 26.28 24.34 26.5 24.53C26.72 24.71 26.81 24.96 26.78 25.26C26.71 26.46 26.43 27.7 25.93 28.97C25.43 30.24 24.64 31.4 23.57 32.45C22.5 33.5 21.13 34.37 19.46 35.06C17.79 35.75 15.77 36.09 13.39 36.09C11.01 36.09 9.16 35.75 7.52 35.06C5.88 34.37 4.52 33.43 3.43 32.23C2.34 31.03 1.53 29.6 1 27.94C0.47 26.29 0.16 24.47 0.1 22.5C0.03 21.13 0 19.66 0 18.09C0 16.52 0.03 15.01 0.1 13.58C0.17 11.64 0.47 9.83999 1 8.15999C1.53 6.48999 2.35 5.04999 3.43 3.84999C4.52 2.64999 5.88 1.69999 7.52 1.01999C9.16 0.32999 11.11 -0.0100098 13.39 -0.0100098C15.67 -0.0100098 17.79 0.32999 19.46 1.01999C21.13 1.70999 22.5 2.56999 23.57 3.62999C24.64 4.67999 25.43 5.83999 25.93 7.10999C26.43 8.37999 26.72 9.61999 26.78 10.82C26.81 11.12 26.72 11.36 26.5 11.55C26.28 11.73 26.02 11.83 25.72 11.83H24.72C24.45 11.83 24.22 11.75 24.02 11.6C23.82 11.45 23.69 11.17 23.62 10.77C23.29 9.26999 22.82 8.01999 22.22 7.02999C21.62 6.03999 20.89 5.24999 20.04 4.64999C19.19 4.04999 18.2 3.61999 17.08 3.36999C15.96 3.11999 14.73 2.98999 13.39 2.98999C10.31 2.98999 7.89 3.83999 6.12 5.54999C4.35 7.25999 3.4 10.01 3.26 13.82" fill="#4D4D4D"/>
                <path d="M120.63 34.85C120.56 34.98 120.45 35.14 120.28 35.33C120.11 35.51 119.86 35.61 119.53 35.61H118.48C118.21 35.61 117.98 35.51 117.78 35.31C117.58 35.11 117.48 34.88 117.48 34.61C117.48 34.44 117.51 34.26 117.58 34.06L129.21 1.7C129.51 0.9 130.08 0.5 130.92 0.5H135.52C136.35 0.5 136.92 0.9 137.22 1.7L148.85 34.04C148.92 34.24 148.95 34.42 148.95 34.59C148.95 34.86 148.85 35.09 148.65 35.29C148.45 35.49 148.22 35.59 147.95 35.59H146.9C146.57 35.59 146.32 35.5 146.15 35.31C145.98 35.13 145.87 34.97 145.8 34.83L134.81 4.14H131.42L120.63 34.83V34.85Z" fill="#4D4D4D"/>
                <path d="M153.89 117.37C153.82 117.5 153.71 117.66 153.54 117.85C153.37 118.03 153.12 118.13 152.79 118.13H151.74C151.47 118.13 151.24 118.03 151.04 117.83C150.84 117.63 150.74 117.4 150.74 117.13C150.74 116.96 150.77 116.78 150.84 116.58L162.47 84.24C162.77 83.44 163.34 83.04 164.17 83.04H168.77C169.6 83.04 170.17 83.44 170.47 84.24L182.1 116.58C182.17 116.78 182.2 116.96 182.2 117.13C182.2 117.4 182.1 117.63 181.9 117.83C181.7 118.03 181.47 118.13 181.2 118.13H180.15C179.82 118.13 179.56 118.04 179.4 117.85C179.23 117.67 179.12 117.51 179.05 117.37L168.06 86.68H164.67L153.88 117.37H153.89Z" fill="#4D4D4D"/>
              </g>
              <defs>
                <clipPath id="clip0_5_45">
                  <rect width="182.21" height="118.12" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </Link>
          
          {/* Desktop Navigation */}
          {windowWidth >= 1060 && (
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center',
            }}>
              {navigationItems.map((item, index) => (
                <Fragment key={item.label}>
                  {index > 0 && <span style={separatorStyle}>|</span>}
                  {item.type === 'page' ? (
                    <Link 
                      href={item.href}
                      style={{
                        ...navItemStyle,
                        color: pathname === item.href ? '#000' : '#666',
                        fontWeight: pathname === item.href ? 500 : 400,
                        transition: 'color 0.2s ease, opacity 0.2s ease',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.color = '#F9A01B';
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.color = pathname === item.href ? '#000' : '#666';
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span 
                      onClick={() => handleCategoryChange(item.category)}
                      style={{
                        ...navItemStyle,
                        color: activeCategory === item.category ? '#000' : '#666',
                        fontWeight: activeCategory === item.category ? 500 : 400,
                        transition: 'color 0.2s ease, opacity 0.2s ease',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.color = '#F9A01B';
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.color = activeCategory === item.category ? '#000' : '#666';
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </Fragment>
              ))}
            </nav>
          )}
          
          {/* Mobile Hamburger Button */}
          {windowWidth < 1060 && (
            <button 
              onClick={toggleMobileMenu}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 60,
                transition: 'opacity 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                // X icon when menu is open
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                // Hamburger icon when menu is closed
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          )}
        </div>
        
        {/* Mobile Menu - Sliding panel from right */}
        {windowWidth < 1060 && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '300px',
            backgroundColor: '#fff',
            zIndex: 55,
            boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 0 20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              height: '100%'
            }}>
              {navigationItems.map((item) => (
                <div key={item.label} style={{ 
                  borderBottom: '1px solid #eaeaea',
                  paddingBottom: '15px',
                  marginBottom: '15px' 
                }}>
                  {item.type === 'page' ? (
                    <Link 
                      href={item.href}
                      style={{
                        display: 'block',
                        padding: '10px 0',
                        fontSize: '18px',
                        fontWeight: pathname === item.href ? 500 : 400,
                        color: pathname === item.href ? '#000' : '#666',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease, opacity 0.2s ease',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                      onMouseOver={e => {
                        e.currentTarget.style.color = '#F9A01B';
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.color = pathname === item.href ? '#000' : '#666';
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span 
                      onClick={() => {
                        handleCategoryChange(item.category);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'block',
                        padding: '10px 0',
                        fontSize: '18px',
                        fontWeight: activeCategory === item.category ? 500 : 400,
                        color: activeCategory === item.category ? '#000' : '#666',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease, opacity 0.2s ease',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.color = '#F9A01B';
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.color = activeCategory === item.category ? '#000' : '#666';
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && windowWidth < 1060 && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(255,255,255,0.9)',
              zIndex: 50
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </header>
      
      {/* Main Content */}
      <div style={{ 
        maxWidth: 1400,
        margin: '0 auto', 
        marginBottom: '35px',
        padding: '0 12px',
        width: '100%',
        boxSizing: 'border-box',
        flexGrow: 1
      }}>
        {children}
      </div>
      
      {/* Footer */}
      <footer style={{
        width: '100%',
        padding: '40px 20px',
        marginTop: '60px',
        borderTop: '1px solid #eaeaea',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1400px',
          marginBottom: '20px',
          flexDirection: windowWidth < 768 ? 'column' : 'row',
          gap: windowWidth < 768 ? '30px' : '0'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: '500' }}>CREAVITA</h3>
            <p style={{ fontSize: '14px', color: '#666', maxWidth: '300px' }}>
              Profesionální grafické služby a kreativní design řešení pro vaše projekty.
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: windowWidth < 768 ? '30px' : '60px',
            flexDirection: windowWidth < 480 ? 'column' : 'row'
          }}>
            <div>
              <h4 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '500' }}>Odkazy</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/about" style={{ fontSize: '14px', color: '#666', textDecoration: 'none', transition: 'opacity 0.2s ease' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                    O nás
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/events" style={{ fontSize: '14px', color: '#666', textDecoration: 'none', transition: 'opacity 0.2s ease' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                    Eventy
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/contact" style={{ fontSize: '14px', color: '#666', textDecoration: 'none', transition: 'opacity 0.2s ease' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '500' }}>Služby</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <span 
                    style={{ fontSize: '14px', color: '#666', cursor: 'pointer', transition: 'opacity 0.2s ease' }} 
                    onClick={() => handleCategoryChange('LOGA')}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    Loga
                  </span>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <span 
                    style={{ fontSize: '14px', color: '#666', cursor: 'pointer', transition: 'opacity 0.2s ease' }} 
                    onClick={() => handleCategoryChange('VIZUÁLNÍ STYL')}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    Vizuální styl
                  </span>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <span 
                    style={{ fontSize: '14px', color: '#666', cursor: 'pointer', transition: 'opacity 0.2s ease' }} 
                    onClick={() => handleCategoryChange('MIRROR DESIGN')}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    Mirror design
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div style={{
          borderTop: '1px solid #eaeaea',
          paddingTop: '20px',
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <p style={{ fontSize: '14px', color: '#666' }}>© {new Date().getFullYear()} CREAVITA. Všechna práva vyhrazena.</p>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/privacy" style={{ fontSize: '14px', color: '#666', textDecoration: 'none', transition: 'opacity 0.2s ease' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              Ochrana soukromí
            </Link>
            <Link href="/terms" style={{ fontSize: '14px', color: '#666', textDecoration: 'none', transition: 'opacity 0.2s ease' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              Podmínky použití
            </Link>
            <Link 
              href="/access" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#666',
                textDecoration: 'none',
                gap: '6px',
                transition: 'opacity 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v3m-3-3h6M5 7h14M5 11h14" />
              </svg>
              Admin přístup
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 