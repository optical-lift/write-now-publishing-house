import Link from 'next/link';
import styles from './book-peek.module.css';

export default function BookPeekPrototypePage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Isolated interaction study</div>
          <h1>Closed-book cover peek</h1>
          <p>
            One rigid book object: spine, front cover, page edge, top, and back move together.
            Hover the book to turn the closed volume toward you.
          </p>
        </div>
        <Link href="/">Back to shelf</Link>
      </div>

      <section className={styles.stage} aria-label="Closed book hover prototype">
        <div className={styles.shelfLine} aria-hidden="true" />
        <div className={styles.scene}>
          <div className={styles.book}>
            <div className={`${styles.face} ${styles.front}`}>
              <img
                src="/recovered-covers/the-wish-fairy-and-dewy-dear/front-cover-restored.jpg"
                alt="The Wish Fairy and Dewy Dear restored front cover"
                draggable={false}
              />
            </div>

            <div className={`${styles.face} ${styles.back}`} aria-hidden="true" />

            <div className={`${styles.face} ${styles.spine}`} aria-hidden="true">
              <span>The Wish Fairy and Dewy Dear</span>
              <small>Alice Ross Colver</small>
            </div>

            <div className={`${styles.face} ${styles.foreEdge}`} aria-hidden="true" />
            <div className={`${styles.face} ${styles.topEdge}`} aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className={styles.notes}>
        <span>rest: spine-dominant</span>
        <span>hover: same closed object turns</span>
        <span>no hinged cover plane</span>
      </div>
    </main>
  );
}
