import Link from 'next/link';
import {
  getWnphPublicChapter,
  getWnphPublicTitle,
  type WnphPublicMediaPlacement,
} from '../../../../../lib/wnph-public';
import ReaderControls from './reader-controls';

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

function Plate({ media, title }: { media: WnphPublicMediaPlacement; title: string }) {
  const printedPosition = media.anchor_data.historical_printed_position;
  return (
    <figure className="reader-plate reader-plate--chapter" data-placement-key={media.placement_key}>
      <div className="reader-plate-frame">
        <img
          src={media.image.url}
          alt={`Historical illustration from the 1922 edition of ${title}; detailed editorial description pending.`}
          loading="eager"
          decoding="async"
        />
      </div>
      <figcaption>
        <span>Historical plate · 1922 edition</span>
        {typeof printedPosition === 'number' ? <span>Original printed position {printedPosition}</span> : null}
      </figcaption>
    </figure>
  );
}

export default async function ChapterReaderPage({ params }: { params: Promise<{ work: string; chapter: string }> }) {
  const { work, chapter } = await params;
  const chapterNumber = Number(chapter);

  if (!Number.isInteger(chapterNumber)) {
    return (
      <main className="reader-unavailable">
        <p>This chapter is not available.</p>
      </main>
    );
  }

  const [reading, titleRecord] = await Promise.all([
    getWnphPublicChapter(work, chapterNumber),
    getWnphPublicTitle(work),
  ]);

  if (!reading) {
    return (
      <main className="reader-unavailable">
        <p>This chapter is not available.</p>
      </main>
    );
  }

  const chapters = titleRecord?.chapters ?? [reading.chapter];
  const author = reading.bibliographic.creators.find((creator) => creator.role === 'author')?.label
    ?? reading.bibliographic.creators[0]?.label
    ?? 'Unknown creator';
  const paragraphs = reading.blocks.filter((block) => block.block_type === 'paragraph');
  const plate = reading.media_placements[0];

  return (
    <main className="reader-shell reader-shell--immersive">
      <ReaderControls
        work={work}
        title={reading.bibliographic.title}
        chapters={chapters}
        currentChapter={reading.chapter.chapter_number}
      />

      <article className="chapter-reader">
        <header className="chapter-opening">
          <Link className="chapter-edition-mark" href={`/books/${work}`}>Write Now recovered edition</Link>
          <div className="chapter-opening-rule" />
          <div className="chapter-number">{reading.chapter.chapter_label}</div>
          <h1>{reading.chapter.chapter_title}</h1>
          <div className="chapter-bookline">
            <span>{reading.bibliographic.title}</span>
            <span>by {author}</span>
          </div>
        </header>

        {plate ? <Plate media={plate} title={reading.bibliographic.title} /> : null}

        <section className="reader-prose" aria-label={`${reading.chapter.chapter_title}, text`}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph.block_key} data-block-key={paragraph.block_key}>{paragraph.text_content}</p>
          ))}
        </section>

        <div className="chapter-end-marker">End of {reading.chapter.chapter_label}</div>

        <nav className="chapter-turn" aria-label="Chapter navigation">
          {reading.previous_chapter ? (
            <Link className="chapter-turn-card previous" href={`/books/${work}/read/${reading.previous_chapter}`}>
              <strong>← Previous chapter</strong>
            </Link>
          ) : (
            <Link className="chapter-turn-card previous" href={`/books/${work}`}>
              <strong>← About this book</strong>
            </Link>
          )}

          {reading.next_chapter ? (
            <Link className="chapter-turn-card next" href={`/books/${work}/read/${reading.next_chapter}`}>
              <strong>Continue reading →</strong>
            </Link>
          ) : (
            <Link className="chapter-turn-card next" href={`/books/${work}`}>
              <strong>About this edition →</strong>
            </Link>
          )}
        </nav>

        <details className="reader-edition-record">
          <summary>Edition record</summary>
          <div>
            <p>Write Now Publishing House public release {reading.release.release_sequence}</p>
            <p>Master · {reading.release.render_master_sha256}</p>
            <p>This reading route serves one chapter at a time and is excluded from search indexing.</p>
          </div>
        </details>
      </article>
    </main>
  );
}
