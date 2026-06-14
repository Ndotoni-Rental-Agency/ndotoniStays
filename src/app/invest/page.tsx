import type { Metadata } from 'next';
import { InvestPageContent } from '@/components/invest/InvestPageContent';

export const metadata: Metadata = {
  title: 'Invest in Ndotoni – Tanzania\'s Most Trusted Rental Platform',
  description:
    'Join us in building Tanzania\'s most trusted rental housing platform. We\'re raising $10K to scale verified rentals, grow our user base, and transform how Tanzanians find homes.',
  keywords: [
    'invest in ndotoni',
    'Tanzania proptech',
    'African startup investment',
    'short-term rentals Tanzania',
    'seed funding Tanzania',
    'real estate tech Africa',
  ],
  openGraph: {
    title: 'Invest in Ndotoni – Tanzania\'s Most Trusted Rental Platform',
    description:
      'Help us build the default way Tanzanians find and list rental homes. Early-stage opportunity in Africa\'s growing proptech market.',
    url: 'https://www.ndotonistays.com/invest',
    siteName: 'ndotoni Stays',
    type: 'website',
  },
};

export default function InvestPage() {
  return <InvestPageContent />;
}
