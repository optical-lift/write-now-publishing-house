import Link from 'next/link';
import { getWnphPublicRelease, type WnphPublicMediaPlacement } from '../../../../lib/wnph-public';

function chapterNumberFor(media: WnphPublicMediaPlacement): number | null {
  const value = media.anchor_data.chapter_number;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return null;
}

function Plate({ media, title }: { media: WnphPublicMediaPlacement; title: string }) {
  const printedPosition = media.anchor_data.historical_printed_position;
  return (
    <figure className="reader-plate" data-placement-key={media.placement_key}>
      <img
        src={media.image.url}
        alt={`Historical illustration from ${title} (1922 edition).`}
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

export default async function ReaderPage({ params }: { params: Promise<{ work: string }> }) {
  const { work } = await params;
  const release = await getWnphPublicRelease(work);

  if (!release) {
    return (
      <main className="reader">
        <div className="reader-placeholder">This publication is not available.</div>
      </main>
    );
  }

  const { payload, payload_sha256: payloadSha } = release;
  const { bibliographic, chapters, ordered_blocks: blocks, media_placements: media } = payload;
  const author = bibliographic.creators.find((creator) => creator.role === 'author')?.label
    ?? bibliographic.creators[0]?.label
    ?? 'Unknown creator';
  const frontispiece = media.find((item) => item.media_role === 'frontispiece');

  return (
    <main className="reader-shell">
      <div className="reader-toolbar" aria-label="Reader information">
        <div className="left"><Link href={`/books/${work}`}>About this edition</Link></div>
        <div className="center">{bibliographic.title}</div>
        <div className="right">{chapters.length} chapters · {media.length} plates</div>
      </div>

      <article className="reader">
        {frontispiece ? (
          <div className="reader-frontispiece">
            <Plate media={frontispiece} title={bibliographic.title} />
          </div>
        ) : null}

        <section className="reader-title">
          <div className="reader-title-inner">
            <div className="kicker">A Write Now recovered edition</div>
            <h1>{bibliographic.title}</h1>
            <div className="author">{author}</div>
            <div className="status">
              Frozen WNPH public release · master {payload.release.render_master_sha256.slice(0, 12)}…
            </div>
          </div>
        </section>

        <nav className="reader-contents" aria-label="Contents">
          <div className="reader-contents-label">Contents</div>
          <ol>
            {chapters.map((chapter) => (
              <li key={chapter.chapter_block_key}>
                <a href={`#chapter-${chapter.chapter_number}`}>
                  <span>{chapter.chapter_label}</span>
                  <strong>{chapter.chapter_title}</strong>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {chapters.map((chapter) => {
          const chapterRoot = blocks.find((block) => block.block_key === chapter.chapter_block_key)?.render_path;
          const paragraphs = chapterRoot
            ? blocks.filter((block) => block.block_type === 'paragraph' && block.render_path.startsWith(`${chapterRoot}.`))
            : [];
          const chapterPlate = media.find((item) => chapterNumberFor(item) === chapter.chapter_number);

          return (
            <section className="chapter" id={`chapter-${chapter.chapter_number}`} key={chapter.chapter_block_key}>
              <div className="chapter-heading">
                <div className="chapter-number">{chapter.chapter_label}</div>
                <h2>{chapter.chapter_title}</h2>
              </div>

              {chapterPlate ? <Plate media={chapterPlate} title={bibliographic.title} /> : null}

              <div className="reader-prose">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.block_key} data-block-key={paragraph.block_key}>{paragraph.text_content}</p>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="reader-release">
          <div>Write Now Publishing House public release {payload.release.release_sequence}</div>
          <div>Public payload SHA-256 · {payloadSha}</div>
          <div>Render master SHA-256 · {payload.release.render_master_sha256}</div>
        </footer>
      </article>
    </main>
  );
}
