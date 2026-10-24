import { Suspense } from 'react';
import { QUERY, prepareStays } from '@/lib/home-stays';
import { HomeProperties } from '@/components/home/HomeProperties';
import { HeroSection } from '@/components/home/HeroSection';
import { LongTermBanner } from '@/components/home/LongTermBanner';
import { TrustSection } from '@/components/home/TrustSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="mx-auto h-80 max-w-7xl animate-pulse rounded-2xl bg-ink-50 motion-reduce:animate-none" aria-label="Loading stays" />}><InitialStays /></Suspense>
      <TrustSection />
      <HowItWorks />
      <CTASection />
      <LongTermBanner />
    </>
  );
}

async function InitialStays() {
  const date = new Date();
  const format = (value: Date) => value.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 1);
  const checkIn = format(date);
  date.setUTCDate(date.getUTCDate() + 1);
  const dates = { checkIn, checkOut: format(date) };
  try {
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
    const key = process.env.NEXT_PUBLIC_API_KEY;
    if (!endpoint || !key) return <HomeProperties />;
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ query: QUERY, variables: { input: { region: 'Dar es Salaam', checkInDate: dates.checkIn, checkOutDate: dates.checkOut, numberOfGuests: 1, limit: 100 } } }),
      next: { revalidate: 300 }, signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return <HomeProperties />;
    const data = await response.json();
    if (data.errors || !data.data?.searchShortTermProperties) return <HomeProperties />;
    return <HomeProperties initialData={{ dates, properties: prepareStays(data.data.searchShortTermProperties.properties || []) }} />;
  } catch { return <HomeProperties />; }
}
