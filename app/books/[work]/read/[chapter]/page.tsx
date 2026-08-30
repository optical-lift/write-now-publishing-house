import Link from 'next/link';
import { getWnphPublicChapter, type WnphPublicMediaPlacement } from '../../../../../lib/wnph-public';

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
    <figure className="reader-plate" data-placement-key={media.placement_key}>
      <img
        src={media.image.url}
        alt={`Historical illustration from the 1922 edition of ${title}; detailed editorial description pending.`}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        Historical illustration from the 1922 edition
        {typeof printedPosition === 'number' ? ` · printed position ${printedPosition}` : ''}
      </figcaption>
    </figure>
  );
}

export default async function ChapterReaderPage({ params }: { params: Promise<{ work: string; chapter: string }> }) {
  const { work, chapter } = await params;
  const chapterNumber = Number(chapter);
  const reading = Number.isInteger(chapterNumber)
    ? await getWnphPublicChapter(work, chapterNumber)
    : null;

  if (!reading) {
    return (
      <main className="reader">
        <div className="reader-placeholder">This chapter is not available.</div>
      </main>
    );
  }

  const author = reading.bibliographic.creators.find((creator) => creator.role === 'author')?.label
    ?? reading.bibliographic.creators[0]?.label
    ?? 'Unknown creator';
  const paragraphs = reading.blocks.filter((block) => block.block_type === 'paragraph');
  const plate = reading.media_placements[0];

  return (
    <main className="reader-shell">
      <div className="reader-toolbar" aria-label="Reader information">
        <div className="left"><Link href={`/books/${work}`}>About this edition</Link></div>
        <div className="center">{reading.bibliographic.title}</div>
        <div className="right">Chapter {reading.chapter.chapter_number} of {reading.chapter_count}</div>
      </div>

      <article className="reader">
        <section className="chapter" id={`chapter-${reading.chapter.chapter_number}`}>
          <div className="chapter-heading">
            <div className="chapter-number">{reading.chapter.chapter_label}</div>
            <h1>{reading.chapter.chapter_title}</h1>
            <div className="author">{author}</div>
          </div>

          {plate ? <Plate media={plate} title={reading.bibliographic.title} /> : null}

          <div className="reader-prose">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.block_key} data-block-key={paragraph.block_key}>{paragraph.text_content}</p>
            ))}
          </div>

          <nav className="reader-actions" aria-label="Chapter navigation">
            {reading.previous_chapter ? <Link href={`/books/${work}/read/${reading.previous_chapter}`}>← Previous chapter</Link> : <span />}
            <span>·</span>
            {reading.next_chapter ? <Link href={`/books/${work}/read/${reading.next_chapter}`}>Next chapter →</Link> : <Link href={`/books/${work}`}>About this edition</Link>}
          </nav>
        </section>

        <footer className="reader-release">
          <div>Write Now Publishing House public release {reading.release.release_sequence}</div>
          <div>Render master SHA-256 · {reading.release.render_master_sha256}</div>
          <div>This reader endpoint serves one chapter at a time and is excluded from search indexing.</div>
        </footer>
      </article>
    </main>
  );
}
