import type { Metadata } from 'next';
import DonationCheckout from '@/components/impact/DonationCheckout';
export const metadata: Metadata = { title: 'Support education | Ndotoni', description: 'Support access to education in Tanzania through Ndotoni.' };
export default function DonatePage() { return <DonationCheckout />; }
