import BookReader from '../../reader-page';

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function ChapterReaderPage({ params }: { params: Promise<{ work: string; chapter: string }> }) {
  const { work, chapter } = await params;
  return <BookReader work={work} chapterNumber={Number(chapter)} />;
}
