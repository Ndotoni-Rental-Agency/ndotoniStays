import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StayLanding from '@/components/seo/StayLanding';
import {
  BASE_PATH,
  MIN_LISTINGS_TO_INDEX,
  fetchRegionStays,
  filterByCategory,
  formatNightly,
  getCategory,
  getRegion,
  pageUrl,
  priceStats,
} from '@/lib/seo/stayPages';

interface Props {
  params: { region: string; category: string };
}

export const revalidate = 3600;
export const dynamicParams = true;

// Rendered on demand (and cached for an hour); thin combinations are noindex.

async function load(params: Props['params']) {
  const region = getRegion(params.region);
  const category = getCategory(params.category);
  if (!region || !category) return null;
  const all = await fetchRegionStays(region.name);
  const stays = filterByCategory(all, category.value);
  if (stays.length === 0) return null;
  return { region, category, stays };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params);
  if (!data) return { title: 'Page not found – ndotoni Stays', robots: { index: false } };

  const { region, category, stays } = data;
  const stats = priceStats(stays);
  const price = stats.currency && stats.min ? ` from ${formatNightly(stats.min, stats.currency)}/night` : '';
  const title = `${category.label} in ${region.name}${price} | ndotoni Stays`;
  const description = `${stays.length} ${category.noun} in ${region.name}, Tanzania${price}. ${category.intro}`.slice(0, 300);
  const url = pageUrl(region.slug, category.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: stays.length >= MIN_LISTINGS_TO_INDEX ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: 'website', siteName: 'ndotoni Stays' },
  };
}

export default async function RegionCategoryPage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();
  const { region, category, stays } = data;

  return (
    <StayLanding
      h1={`${category.label} in ${region.name}`}
      topic={`${category.noun} in ${region.name}`}
      intro={`${category.intro} ${region.intro}`}
      tips={[...category.tips, ...region.tips.slice(0, 1)]}
      stays={stays}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Places to stay', href: BASE_PATH },
        { name: region.name, href: `${BASE_PATH}/${region.slug}` },
        { name: category.label, href: `${BASE_PATH}/${region.slug}/${category.slug}` },
      ]}
      chips={[{ href: `${BASE_PATH}/${region.slug}`, label: `All stays in ${region.name}` }]}
      chipsHeading="Keep exploring"
      searchHref={`/search?region=${encodeURIComponent(region.name)}&category=${category.value}`}
    />
  );
}
