import './globals.css';
import { metadata } from './metadata';
import LenisProvider from '@/lib/lenis';

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className="yXJ5eG_variable">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
