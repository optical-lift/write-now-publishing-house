import type { Metadata } from 'next';
import { getWnphPublicLibrary } from '../../lib/wnph-public';
import SpatialLibrary from './spatial-library';
import styles from './library.module.css';

export const metadata: Metadata = {
  title: 'The Library · Write Now Publishing House',
  description: 'Recovered works returned to reading by Write Now Publishing House.',
};

export default async function LibraryPage() {
  const library = await getWnphPublicLibrary();

  if (!library) {
    return (
      <main className={styles.library}>
        <div className={styles.inner}>
          <div className={styles.intro}>
            <div className={styles.eyebrow}>The Library</div>
            <h1>Books recovered for reading again.</h1>
          </div>
          <div className={styles.empty}>The library catalogue is temporarily unavailable.</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.library}>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <div className={styles.eyebrow}>The Library</div>
          <h1>Welcome to the library.</h1>
          <p>
            {library.books.length} {library.books.length === 1 ? 'work' : 'works'} across {library.shelves.length}{' '}
            {library.shelves.length === 1 ? 'shelf' : 'shelves'}. Wander the collection and pull a work forward to read it.
          </p>
        </header>

        <SpatialLibrary library={library} />
      </div>
    </main>
  );
}
