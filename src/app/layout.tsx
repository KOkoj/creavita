import { Inter } from 'next/font/google';
// import { AuthProvider } from '@/contexts/AuthContext'; // Removed
import './globals.css';
import { metadata } from './metadata';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { font-family: Inter, sans-serif; color: #374151; background: #fff; overflow-x: hidden; }
          a { color: inherit; text-decoration: none; }
          
          /* Improve accessibility */
          :focus { outline: 2px solid #0070f3; outline-offset: 2px; }
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}</style>
      </head>
      <body className={inter.className}>
        {/* <AuthProvider> // Removed */}
          <main style={{ minHeight: '100vh', backgroundColor: '#fff', overflow: 'hidden' }}>
            {children}
          </main>
        {/* </AuthProvider> // Removed */}
      </body>
    </html>
  );
} 