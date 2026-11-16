import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StayLanding from '@/components/seo/StayLanding';
import {
  BASE_PATH,
  MIN_LISTINGS_TO_INDEX,
  REGIONS,
  categoriesWithStays,
  fetchRegionStays,
  formatNightly,
  getRegion,
  pageUrl,
  priceStats,
} from '@/lib/seo/stayPages';

interface Props {
  params: { region: string };
}

export const revalidate = 3600;

export function generateStaticParams() {
  return REGIONS.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = getRegion(params.region);
  if (!region) return { title: 'Page not found – ndotoni Stays', robots: { index: false } };

  const stays = await fetchRegionStays(region.name);
  const stats = priceStats(stays);
  const price = stats.currency && stats.min ? ` from ${formatNightly(stats.min, stats.currency)}/night` : '';
  const title = `Places to Stay in ${region.name}${price} | ndotoni Stays`;
  const description = `${stays.length} places to stay in ${region.name}, Tanzania${price}: apartments, houses, party venues and more. ${region.intro}`.slice(0, 300);
  const url = pageUrl(region.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: stays.length >= MIN_LISTINGS_TO_INDEX ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: 'website', siteName: 'ndotoni Stays' },
  };
}

export default async function RegionPage({ params }: Props) {
  const region = getRegion(params.region);
  if (!region) notFound();

  const stays = await fetchRegionStays(region.name);
  const categories = categoriesWithStays(stays);

  return (
    <StayLanding
      h1={`Places to Stay in ${region.name}`}
      topic={`stays in ${region.name}`}
      intro={region.intro}
      tips={region.tips}
      stays={stays}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Places to stay', href: BASE_PATH },
        { name: region.name, href: `${BASE_PATH}/${region.slug}` },
      ]}
      chips={categories.map(({ category, count }) => ({
        href: `${BASE_PATH}/${region.slug}/${category.slug}`,
        label: `${category.label} in ${region.name}`,
        count,
      }))}
      chipsHeading={`Types of stays in ${region.name}`}
      searchHref={`/search?region=${encodeURIComponent(region.name)}`}
    />
  );
}
