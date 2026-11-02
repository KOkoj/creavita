import { Inter } from 'next/font/google';
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
    <html lang="cs">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
