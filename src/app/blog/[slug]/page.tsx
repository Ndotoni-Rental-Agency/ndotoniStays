import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ArticleSections } from '@/components/blog/ArticleBody';
import { Cover } from '@/components/blog/Cover';
import { getBlogStays } from '@/lib/blog-stays';
import { photography } from '../photography';
import { blogPosts, getPostBySlug, guideSearchHref, readingMinutes } from '../posts';

type Props = { params: { slug: string } };
const BASE = 'https://www.ndotonistays.com';
const formatDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const revalidate = 300;
export function generateStaticParams() { return blogPosts.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Guide not found', robots: { index: false } };
  const photo = post.photo === undefined ? undefined : photography[post.photo];
  return {
    title: `${post.title} | Ndotoni Stays`, description: post.description,
    alternates: { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, url: `${BASE}/blog/${post.slug}`, type: 'article', publishedTime: post.date, modifiedTime: post.updated || post.date, authors: ['Ndotoni Stays'], ...(photo && { images: [{ url: photo.src, alt: photo.alt }] }) },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const stays = await getBlogStays(post.region, post.stayCategory);
  const index = blogPosts.indexOf(post);
  const photo = post.photo === undefined ? undefined : photography[post.photo];
  const url = `${BASE}/blog/${post.slug}`;
  const related = [...blogPosts.slice(index + 1), ...blogPosts.slice(0, index)].slice(0, 3);
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', headline: post.title, description: post.description, ...(photo && { image: photo.src }), datePublished: post.date, dateModified: post.updated || post.date, inLanguage: 'en', author: { '@type': 'Organization', name: 'Ndotoni Stays', url: BASE }, publisher: { '@type': 'Organization', name: 'Ndotoni Stays', url: BASE }, mainEntityOfPage: url },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: BASE }, { '@type': 'ListItem', position: 2, name: 'Stay guides', item: `${BASE}/blog` }, { '@type': 'ListItem', position: 3, name: post.title, item: url }] },
    ...(post.faqs.length ? [{ '@type': 'FAQPage', mainEntity: post.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  ] };
  const tocLink = 'block rounded-lg px-2 py-1.5 leading-6 text-ink-700 hover:bg-brand-50 hover:text-brand-700';

  return <div className="bg-ink-50 pb-20 text-ink-900">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

    <header className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-700"><ArrowLeft size={16} aria-hidden="true" /> All stay guides</Link>
      <div className="mt-4 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">{post.category} · {post.region}</p>
        <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-[56px]">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-ink-500">{post.description}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
          <span className="font-semibold text-ink-800">Ndotoni Stays</span><span aria-hidden="true">·</span>
          <time dateTime={post.updated || post.date}>{post.updated && post.updated !== post.date ? `Updated ${formatDate(post.updated)}` : formatDate(post.date)}</time>
          <span aria-hidden="true">·</span><span>{readingMinutes(post)} min read</span>
        </p>
      </div>
      {photo && <figure className="mt-10">
        <Cover photo={photo} label={post.category} index={index} priority sizes="(max-width: 1152px) 100vw, 1152px" className="aspect-[16/10] rounded-3xl sm:aspect-[2.2/1]" />
        <figcaption className="mt-2 text-xs text-ink-500">Photography: <Link href={`/property/${photography[post.photo!].id}`} className="underline underline-offset-2 hover:text-brand-700">{photo.alt}</Link></figcaption>
      </figure>}
    </header>

    <div className="mx-auto mt-10 grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
      <article lang="en" className="min-w-0 max-w-[700px]">
        <p className="text-xl leading-9 text-ink-800">{post.intro}</p>

        <section aria-labelledby="at-a-glance" className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-ink-100 sm:p-8">
          <h2 id="at-a-glance" className="text-sm font-bold uppercase tracking-[0.14em] text-brand-700">At a glance</h2>
          <ul className="mt-4 space-y-3">
            {post.takeaways.map(t => <li key={t} className="flex gap-3 leading-7 text-ink-800"><span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-600 text-white"><Check size={13} strokeWidth={3} aria-hidden="true" /></span>{t}</li>)}
          </ul>
        </section>

        <ArticleSections sections={post.sections} />

        {post.faqs.length > 0 && <section aria-labelledby="faq-title" id="faq" className="scroll-mt-28 pt-14">
          <h2 id="faq-title" className="mb-5 text-2xl font-bold tracking-tight sm:text-[28px]">Common questions</h2>
          <div className="divide-y divide-ink-100 rounded-3xl bg-white ring-1 ring-ink-100">
            {post.faqs.map(f => <details key={f.q} className="group px-5 py-1 sm:px-6">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">{f.q}<ChevronDown size={18} aria-hidden="true" className="flex-none text-ink-500 transition-transform group-open:rotate-180" /></summary>
              <p className="pb-5 leading-7 text-ink-700">{f.a}</p>
            </details>)}
          </div>
        </section>}

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-6 text-sm">
          <span className="text-ink-500">Planning with someone?</span>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full bg-white px-4 font-semibold text-ink-800 ring-1 ring-inset ring-ink-100 hover:ring-brand-600">Share on WhatsApp</a>
        </div>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-5">
          <nav aria-label="In this guide" className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">In this guide</p>
            <ol className="space-y-1 text-sm">
              {post.sections.map((s, i) => <li key={s.title}><a href={`#section-${i + 1}`} className={tocLink}>{s.title}</a></li>)}
              {post.faqs.length > 0 && <li><a href="#faq" className={tocLink}>Common questions</a></li>}
              <li><a href="#stays" className={tocLink}>Places to stay</a></li>
            </ol>
          </nav>
          <div className="rounded-3xl bg-brand-900 p-6 text-white">
            <p className="text-lg font-bold leading-snug">Ready to compare?</p>
            <p className="mt-2 text-sm leading-6 text-brand-100">Add your dates and guests to see real totals in {post.region}.</p>
            <Link href={guideSearchHref(post)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-600 px-4 text-sm font-semibold hover:bg-brand-500">Search {post.region}</Link>
          </div>
        </div>
      </aside>
    </div>

    <section id="stays" aria-labelledby="stays-title" className="mx-auto mt-16 max-w-6xl scroll-mt-28 px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-ink-100 sm:p-10">
        <h2 id="stays-title" className="text-2xl font-bold tracking-tight sm:text-3xl">Places to stay in {post.region}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-500">{stays.properties.length ? `Live results for 1 guest, ${formatDate(stays.checkIn)} to ${formatDate(stays.checkOut)}, matching this guide’s location and category. Not ranked or endorsed — confirm facilities, prices and availability for your own dates.` : 'We couldn’t load sample listings right now. Search with your own dates to see what’s available.'}</p>
        {stays.properties.length > 0 && <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{stays.properties.map(p => <PropertyCard key={p.propertyId} property={p} checkIn={stays.checkIn} checkOut={stays.checkOut} />)}</div>}
        <Link href={guideSearchHref(post)} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700">Choose your dates <ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>

    <section aria-labelledby="more-guides" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 id="more-guides" className="mb-6 text-2xl font-bold tracking-tight">More stay guides</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {related.map(r => <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
          <Cover photo={r.photo === undefined ? undefined : photography[r.photo]} label={r.category} index={blogPosts.indexOf(r)} sizes="(max-width: 639px) 100vw, 33vw" className="mb-4 aspect-[16/10]" />
          <p className="text-xs font-semibold text-brand-700">{r.category}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug group-hover:text-brand-700">{r.title}</h3>
        </Link>)}
      </div>
    </section>
  </div>;
}
