import Link from 'next/link';
import { PropertyCard } from '@/components/property/PropertyCard';
import type { Property } from '@/lib/home-stays';
import { BASE_URL, formatNightly, priceStats } from '@/lib/seo/stayPages';

interface Crumb {
  name: string;
  href: string;
}

interface Chip {
  href: string;
  label: string;
  count?: number;
}

interface Props {
  h1: string;
  /** Used in FAQ copy, e.g. "party venues in Dar es Salaam" */
  topic: string;
  intro: string;
  tips: string[];
  stays: Property[];
  breadcrumbs: Crumb[];
  chips?: Chip[];
  chipsHeading?: string;
  searchHref: string;
}

const MAX_CARDS = 24;

function buildFaq(topic: string, stays: Property[]) {
  const stats = priceStats(stays);
  const instant = stays.filter((s) => s.instantBookEnabled).length;
  const faq: { q: string; a: string }[] = [];

  if (stats.currency && stats.min && stats.median && stats.max) {
    faq.push({
      q: `How much do ${topic} cost?`,
      a: `Across the ${stats.count} listings on ndotoni Stays priced in ${stats.currency}, nightly rates run from about ${formatNightly(stats.min, stats.currency)} to ${formatNightly(stats.max, stats.currency)}, with a typical (median) rate near ${formatNightly(stats.median, stats.currency)}. Cleaning fees, taxes and guest numbers can change the total, so add your dates to see the full price.`,
    });
  }

  faq.push({
    q: `How do I book ${topic} on ndotoni Stays?`,
    a: 'Open a listing, choose your dates and number of guests, and follow the booking steps. You will see the full price before you pay.',
  });

  if (instant > 0) {
    faq.push({
      q: 'Can I book instantly?',
      a: `Some hosts allow instant booking – currently ${instant} of the ${stays.length} listings shown here. Others need the host to approve your request first, which the listing page makes clear.`,
    });
  }

  faq.push({
    q: 'What should I check before I book?',
    a: 'Read the listing description and house rules, check the number of guests allowed, look at the location on the map, and read reviews from previous guests where available.',
  });

  return faq;
}

/** Server component – everything is in the initial HTML for crawlers. */
export default function StayLanding({ h1, topic, intro, tips, stays, breadcrumbs, chips, chipsHeading, searchHref }: Props) {
  const stats = priceStats(stays);
  const faq = buildFaq(topic, stays);
  const cards = stays.slice(0, MAX_CARDS);
  const abs = (href: string) => (href.startsWith('http') ? href : `${BASE_URL}${href}`);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href) })),
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-ink-900">{c.name}</span>
                ) : (
                  <Link href={c.href} className="hover:text-brand-700">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{h1}</h1>
          <p className="mt-4 leading-relaxed text-ink-700">{intro}</p>
        </header>

        <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Listings" value={String(stays.length)} />
          <Stat label="Lowest / night" value={stats.currency && stats.min ? formatNightly(stats.min, stats.currency) : '–'} />
          <Stat label="Typical / night" value={stats.currency && stats.median ? formatNightly(stats.median, stats.currency) : '–'} />
          <Stat label="Highest / night" value={stats.currency && stats.max ? formatNightly(stats.max, stats.currency) : '–'} />
        </dl>
        {stats.currency && (
          <p className="mt-2 text-xs text-ink-500">
            Nightly rates before fees, based on {stats.count} listings priced in {stats.currency}. Add dates to see the full price.
          </p>
        )}

        <section className="mt-10" aria-labelledby="stays-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 id="stays-heading" className="text-xl font-semibold text-ink-900 sm:text-2xl">
              {h1}
            </h2>
            <Link href={searchHref} className="whitespace-nowrap text-sm font-medium text-brand-700 hover:underline">
              Search with dates →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((property, index) => (
              <PropertyCard key={property.propertyId} property={property} priority={index < 2} />
            ))}
          </div>
          {stays.length > MAX_CARDS && (
            <div className="mt-8 text-center">
              <Link href={searchHref} className="inline-flex min-h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700">
                See all {stays.length} listings
              </Link>
            </div>
          )}
        </section>

        {chips && chips.length > 0 && (
          <section className="mt-12" aria-labelledby="chips-heading">
            <h2 id="chips-heading" className="mb-3 text-xl font-semibold text-ink-900">
              {chipsHeading}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="inline-block rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 hover:border-brand-500 hover:text-brand-700">
                    {c.label}
                    {typeof c.count === 'number' && <span className="text-ink-400"> ({c.count})</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tips.length > 0 && (
          <section className="mt-12 max-w-3xl" aria-labelledby="tips-heading">
            <h2 id="tips-heading" className="mb-3 text-xl font-semibold text-ink-900">
              Tips before you book
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-ink-700">
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-3 text-xl font-semibold text-ink-900">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-ink-200 rounded-xl border border-ink-200 bg-white">
            {faq.map((f) => (
              <details key={f.q} className="p-4">
                <summary className="cursor-pointer font-medium text-ink-900">{f.q}</summary>
                <p className="mt-2 leading-relaxed text-ink-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 max-w-3xl rounded-xl border border-ink-200 bg-ink-50 p-5">
          <h2 className="font-semibold text-ink-900">Have a place to share?</h2>
          <p className="mt-1 text-sm text-ink-700">List your space on ndotoni Stays and reach guests looking for stays, venues and locations across Tanzania.</p>
          <Link href="/become-host" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
            Become a host →
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-ink-900 sm:text-lg">{value}</dd>
    </div>
  );
}
