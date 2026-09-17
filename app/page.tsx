import Link from 'next/link';
import { getWnphPublicLibrary } from '../lib/wnph-public';
import SpatialLibrary from './library/spatial-library';
import styles from './library/library.module.css';

export default async function HomePage() {
  const library = await getWnphPublicLibrary();

  return (
    <main>
      <section className="home">
        <div className="home-inner">
          <div className="eyebrow">A recovery press</div>
          <h1>Books returned to reading.</h1>
          <p>
            Write Now Publishing House recovers historical works from surviving evidence and rebuilds them as modern, traceable editions for web, ebook, audio, print, and libraries.
          </p>
          <div className="home-actions">
            <Link className="button" href="/library">Enter the library</Link>
            <Link className="button secondary" href="/about">About Write Now</Link>
          </div>
        </div>
      </section>

      <section className={styles.library} aria-label="Library shelves">
        <div className={styles.inner}>
          <header className={styles.homeLibraryIntro}>
            <div className={styles.eyebrow}>The Library</div>
          </header>

          {!library ? (
            <div className={styles.empty}>The library catalogue is temporarily unavailable.</div>
          ) : (
            <SpatialLibrary library={library} showDirectory={false} presentation="dissolved" />
          )}
        </div>
      </section>
    </main>
  );
}
