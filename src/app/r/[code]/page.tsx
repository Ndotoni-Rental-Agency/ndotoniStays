import type { Metadata } from 'next';
import { ReferralWelcome } from '@/components/refer/ReferralWelcome';
export const metadata: Metadata = {
  title: 'Your invitation to Ndotoni Stays',
  description: 'A friend invited you to Ndotoni Stays. Book a great place to stay, or list yours for free.',
  robots: { index: false, follow: false },
};
export default function ReferralPage({ params }: { params: { code: string } }) {
  return <ReferralWelcome code={params.code} />;
}
