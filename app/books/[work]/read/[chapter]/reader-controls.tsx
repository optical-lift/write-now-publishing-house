'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { WnphPublicChapter } from '../../../../../lib/wnph-public';

type EditionSummary = {
  author: string;
  chapterCount: number;
  releaseSequence: number;
  masterSha256: string;
  payloadSha256: string | null;
  rights: string;
};

type Props = {
  work: string;
  title: string;
  chapters: WnphPublicChapter[];
  currentChapter: number;
  edition: EditionSummary;
};

const sizes = ['small', 'standard', 'large'] as const;
const measures = ['narrow', 'standard', 'wide'] as const;

type Size = (typeof sizes)[number];
type Measure = (typeof measures)[number];

export default function ReaderControls({ work, title, chapters, currentChapter, edition }: Props) {
  const [contentsOpen, setContentsOpen] = useState(false);
  const [editionOpen, setEditionOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [size, setSize] = useState<Size>('standard');
  const [measure, setMeasure] = useState<Measure>('standard');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const savedSize = window.localStorage.getItem('wnph-reader-size') as Size | null;
    const savedMeasure = window.localStorage.getItem('wnph-reader-measure') as Measure | null;
    if (savedSize && sizes.includes(savedSize)) setSize(savedSize);
    if (savedMeasure && measures.includes(savedMeasure)) setMeasure(savedMeasure);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.readerSize = size;
    window.localStorage.setItem('wnph-reader-size', size);
  }, [size]);

  useEffect(() => {
    document.documentElement.dataset.readerMeasure = measure;
    window.localStorage.setItem('wnph-reader-measure', measure);
  }, [measure]);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const closePanels = () => {
    setContentsOpen(false);
    setEditionOpen(false);
    setSettingsOpen(false);
  };

  const chapterHref = (number: number) => number === 1
    ? `/books/${work}`
    : `/books/${work}/read/${number}`;

  return (
    <>
      <div className="bookbar" aria-label="Reading controls">
        <div className="bookbar-progress" aria-hidden="true" style={{ width: `${progress}%` }} />
        <Link className="bookbar-mark" href="/library" aria-label="Return to the library">WN</Link>
        <div className="bookbar-title" title={title}>{title}</div>
        <div className="bookbar-actions">
          <button
            type="button"
            className={contentsOpen ? 'reader-control active' : 'reader-control'}
            aria-expanded={contentsOpen}
            onClick={() => {
              setContentsOpen((value) => !value);
              setEditionOpen(false);
              setSettingsOpen(false);
            }}
          >
            Contents
          </button>
          <button
            type="button"
            className={editionOpen ? 'reader-control active' : 'reader-control'}
            aria-expanded={editionOpen}
            onClick={() => {
              setEditionOpen((value) => !value);
              setContentsOpen(false);
              setSettingsOpen(false);
            }}
          >
            Edition
          </button>
          <button
            type="button"
            className={settingsOpen ? 'reader-control reader-aa active' : 'reader-control reader-aa'}
            aria-expanded={settingsOpen}
            aria-label="Reading settings"
            onClick={() => {
              setSettingsOpen((value) => !value);
              setContentsOpen(false);
              setEditionOpen(false);
            }}
          >
            Aa
          </button>
        </div>
      </div>

      {(contentsOpen || editionOpen || settingsOpen)
        ? <button className="reader-scrim" aria-label="Close reader panel" onClick={closePanels} />
        : null}

      <aside className={contentsOpen ? 'reader-panel open' : 'reader-panel'} aria-hidden={!contentsOpen}>
        <div className="reader-panel-heading">
          <span>Contents</span>
          <button type="button" onClick={() => setContentsOpen(false)} aria-label="Close contents">×</button>
        </div>
        <ol className="reader-chapter-list">
          {chapters.map((chapter) => (
            <li key={chapter.chapter_block_key} className={chapter.chapter_number === currentChapter ? 'current' : ''}>
              <Link href={chapterHref(chapter.chapter_number)} onClick={closePanels}>
                <span>{chapter.chapter_label}</span>
                <strong>{chapter.chapter_title}</strong>
              </Link>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="reader-panel-about"
          onClick={() => {
            setContentsOpen(false);
            setEditionOpen(true);
          }}
        >
          About this edition →
        </button>
      </aside>

      <aside className={editionOpen ? 'reader-panel reader-edition-panel open' : 'reader-panel reader-edition-panel'} aria-hidden={!editionOpen}>
        <div className="reader-panel-heading">
          <span>About this edition</span>
          <button type="button" onClick={() => setEditionOpen(false)} aria-label="Close edition information">×</button>
        </div>

        <div className="reader-edition-title">
          <h2>{title}</h2>
          <p>{edition.author}</p>
        </div>

        <section className="reader-edition-group">
          <div className="reader-edition-label">The work</div>
          <p>{edition.chapterCount} chapters in this released web edition.</p>
        </section>

        <section className="reader-edition-group">
          <div className="reader-edition-label">The edition</div>
          <p>Frozen public release {edition.releaseSequence}, derived from WNPH master {edition.masterSha256.slice(0, 12)}…</p>
        </section>

        <section className="reader-edition-group">
          <div className="reader-edition-label">Rights</div>
          <p>{edition.rights}</p>
        </section>

        <section className="reader-edition-group reader-edition-technical">
          <div className="reader-edition-label">Technical record</div>
          <p><span>Master SHA-256</span><code>{edition.masterSha256}</code></p>
          {edition.payloadSha256 ? <p><span>Public payload SHA-256</span><code>{edition.payloadSha256}</code></p> : null}
        </section>

        <Link className="reader-edition-library" href="/library">Back to the library →</Link>
      </aside>

      <aside className={settingsOpen ? 'reader-panel reader-settings open' : 'reader-panel reader-settings'} aria-hidden={!settingsOpen}>
        <div className="reader-panel-heading">
          <span>Reading settings</span>
          <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close reading settings">×</button>
        </div>

        <div className="reader-setting-group">
          <div className="reader-setting-label">Text size</div>
          <div className="reader-segmented" role="group" aria-label="Text size">
            <button type="button" className={size === 'small' ? 'active' : ''} onClick={() => setSize('small')}>A</button>
            <button type="button" className={size === 'standard' ? 'active' : ''} onClick={() => setSize('standard')}>A</button>
            <button type="button" className={size === 'large' ? 'active' : ''} onClick={() => setSize('large')}>A</button>
          </div>
        </div>

        <div className="reader-setting-group">
          <div className="reader-setting-label">Line width</div>
          <div className="reader-segmented reader-measure-control" role="group" aria-label="Line width">
            <button type="button" className={measure === 'narrow' ? 'active' : ''} onClick={() => setMeasure('narrow')}>Narrow</button>
            <button type="button" className={measure === 'standard' ? 'active' : ''} onClick={() => setMeasure('standard')}>Book</button>
            <button type="button" className={measure === 'wide' ? 'active' : ''} onClick={() => setMeasure('wide')}>Wide</button>
          </div>
        </div>

        <p className="reader-setting-note">These settings change only this browser’s presentation. They do not alter the WNPH edition.</p>
      </aside>
    </>
  );
}
