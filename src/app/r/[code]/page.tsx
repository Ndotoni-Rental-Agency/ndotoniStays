import type { Metadata } from 'next';
import { ReferralWelcome } from '@/components/refer/ReferralWelcome';
export const metadata: Metadata = {
  title: 'List your property with Ndotoni',
  description: 'Your invitation to Ndotoni. List your property online or get help on WhatsApp.',
  robots: { index: false, follow: false },
};
export default function ReferralPage({ params }: { params: { code: string } }) {
  return <ReferralWelcome code={params.code} />;
}
