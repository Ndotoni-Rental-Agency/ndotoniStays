import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get the ndotoni App',
  description:
    'Download ndotoni on iOS or Android. Book stays, party venues, and event spaces across Tanzania from your phone.',
  openGraph: {
    title: 'Get the ndotoni App',
    description:
      'Download ndotoni on iOS or Android. Book stays, party venues, and event spaces across Tanzania.',
    type: 'website',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
