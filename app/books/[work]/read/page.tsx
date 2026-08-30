import { redirect } from 'next/navigation';

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function ReaderEntryPage({ params }: { params: Promise<{ work: string }> }) {
  const { work } = await params;
  redirect(`/books/${work}/read/1`);
}
