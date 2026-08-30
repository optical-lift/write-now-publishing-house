import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Write Now Publishing House',
  description: 'Recovered works, rebuilt for modern reading without losing their source history.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/">Write Now Publishing House</Link>
            <nav className="nav" aria-label="Primary navigation">
              <Link href="/books/the-wish-fairy-and-dewy-dear">Books</Link>
              <Link href="/studio">Studio</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
