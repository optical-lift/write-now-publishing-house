'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { WnphPublicChapter } from '../../../../../lib/wnph-public';

type Props = {
  work: string;
  title: string;
  chapters: WnphPublicChapter[];
  currentChapter: number;
};

const sizes = ['small', 'standard', 'large'] as const;
const measures = ['narrow', 'standard', 'wide'] as const;

type Size = (typeof sizes)[number];
type Measure = (typeof measures)[number];

export default function ReaderControls({ work, title, chapters, currentChapter }: Props) {
  const [contentsOpen, setContentsOpen] = useState(false);
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
    setSettingsOpen(false);
  };

  return (
    <>
      <div className="bookbar" aria-label="Reading controls">
        <div className="bookbar-progress" aria-hidden="true" style={{ width: `${progress}%` }} />
        <Link className="bookbar-mark" href={`/books/${work}`} aria-label="About this edition">WN</Link>
        <div className="bookbar-title" title={title}>{title}</div>
        <div className="bookbar-actions">
          <button
            type="button"
            className={contentsOpen ? 'reader-control active' : 'reader-control'}
            aria-expanded={contentsOpen}
            onClick={() => { setContentsOpen((value) => !value); setSettingsOpen(false); }}
          >
            Contents
          </button>
          <button
            type="button"
            className={settingsOpen ? 'reader-control reader-aa active' : 'reader-control reader-aa'}
            aria-expanded={settingsOpen}
            aria-label="Reading settings"
            onClick={() => { setSettingsOpen((value) => !value); setContentsOpen(false); }}
          >
            Aa
          </button>
        </div>
      </div>

      {(contentsOpen || settingsOpen) ? <button className="reader-scrim" aria-label="Close reader panel" onClick={closePanels} /> : null}

      <aside className={contentsOpen ? 'reader-panel open' : 'reader-panel'} aria-hidden={!contentsOpen}>
        <div className="reader-panel-heading">
          <span>Contents</span>
          <button type="button" onClick={() => setContentsOpen(false)} aria-label="Close contents">×</button>
        </div>
        <ol className="reader-chapter-list">
          {chapters.map((chapter) => (
            <li key={chapter.chapter_block_key} className={chapter.chapter_number === currentChapter ? 'current' : ''}>
              <Link href={`/books/${work}/read/${chapter.chapter_number}`} onClick={closePanels}>
                <span>{chapter.chapter_label}</span>
                <strong>{chapter.chapter_title}</strong>
              </Link>
            </li>
          ))}
        </ol>
        <Link className="reader-panel-about" href={`/books/${work}`}>About this edition →</Link>
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
