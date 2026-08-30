import BookReader from './reader-page';

export default async function BookPage({ params }: { params: Promise<{ work: string }> }) {
  const { work } = await params;
  return <BookReader work={work} chapterNumber={1} />;
}
