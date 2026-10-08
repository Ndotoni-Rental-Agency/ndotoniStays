import type { Metadata } from 'next';
import ImpactContent from './ImpactContent';

export const metadata: Metadata = {
  title: 'Our education mission | Ndotoni',
  description: 'Ndotoni commits 15% of its annual profit to supporting access to education in Tanzania.',
};

export default function ImpactPage() { return <ImpactContent />; }
