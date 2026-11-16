import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_PATH, MIN_LISTINGS_TO_INDEX, REGIONS, fetchRegionStays, formatNightly, pageUrl, priceStats } from '@/lib/seo/stayPages';

export const revalidate = 3600;

const title = 'Places to Stay in Tanzania – Apartments, Beach Stays, Party Venues | ndotoni Stays';
const description =
  'Browse places to stay across Tanzania: city apartments, beach houses, safari stops, party venues and photoshoot locations in Dar es Salaam, Zanzibar, Arusha and more.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl() },
  openGraph: { title, description, url: pageUrl(), type: 'website', siteName: 'ndotoni Stays' },
};

export default async function PlacesToStayHub() {
  const regions = await Promise.all(
    REGIONS.map(async (region) => {
      const stays = await fetchRegionStays(region.name);
      return { region, count: stays.length, stats: priceStats(stays) };
    }),
  );
  // Only link regions that have enough listings to be indexable pages.
  const visible = regions.filter((r) => r.count >= MIN_LISTINGS_TO_INDEX).sort((a, b) => b.count - a.count);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ndotonistays.com/' },
      { '@type': 'ListItem', position: 2, name: 'Places to stay', item: pageUrl() },
    ],
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Places to Stay in Tanzania</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-ink-700">
          Choose a destination to see apartments, houses, beach stays, party venues, photoshoot locations and more listed on
          ndotoni Stays, with nightly rates and host details.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {visible.map(({ region, count, stats }) => (
            <li key={region.slug}>
              <Link href={`${BASE_PATH}/${region.slug}`} className="block h-full rounded-xl border border-ink-200 bg-white p-5 hover:border-brand-500">
                <h2 className="text-lg font-semibold text-ink-900">Places to stay in {region.name}</h2>
                <p className="mt-1 text-sm text-ink-600">
                  {count} {count === 1 ? 'listing' : 'listings'}
                  {stats.currency && stats.min ? ` · from ${formatNightly(stats.min, stats.currency)}/night` : ''}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-ink-700">{region.intro}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-ink-600">
          Looking for a long-term rental instead?{' '}
          <a href="https://www.ndotoni.com/nyumba-za-kupanga" className="text-brand-700 hover:underline">
            Browse rentals on ndotoni
          </a>
          .
        </p>
      </div>
    </div>
  );
}
