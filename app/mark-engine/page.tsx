import type { Metadata } from 'next';
import MarkEngineClient from './mark-engine-client';

export const metadata: Metadata = {
  title: 'The Mark Engine · Write Now Publishing House',
  description: 'Blind functional clustering workbench for comparing durable marks by topology, distribution, state transition, and relation.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarkEnginePage() {
  return <MarkEngineClient />;
}
