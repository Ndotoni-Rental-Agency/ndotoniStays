import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { photography } from '../photography';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getBlogStays } from '@/lib/blog-stays';
import { blogPosts, getPostBySlug, guideSearchHref } from '../posts';

type Props = { params: { slug: string } };
const BASE = 'https://www.ndotonistays.com';
export const revalidate = 300;
export function generateStaticParams() { return blogPosts.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Guide not found', robots: { index: false } };
  return { title: `${post.title} | Ndotoni Stays`, description: post.description, alternates: { canonical: `${BASE}/blog/${post.slug}` }, openGraph: { title: post.title, description: post.description, url: `${BASE}/blog/${post.slug}`, type: 'article', publishedTime: post.date, authors: ['Ndotoni Stays'] } };
}
export default async function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const stays = await getBlogStays(post.region, post.stayCategory);
  const url = `${BASE}/blog/${post.slug}`;
  const photo = photography[blogPosts.findIndex(p => p.slug === post.slug) % photography.length];
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', headline: post.title, description: post.description, datePublished: post.date, dateModified: post.date, inLanguage: 'en', author: { '@type': 'Organization', name: 'Ndotoni Stays', url: BASE }, publisher: { '@type': 'Organization', name: 'Ndotoni Stays', url: BASE }, mainEntityOfPage: url },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: BASE }, { '@type': 'ListItem', position: 2, name: 'Stay guides', item: `${BASE}/blog` }, { '@type': 'ListItem', position: 3, name: post.title, item: url }] },
  ] };
  return <div className="bg-[#f5f3ed] pb-20"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}/>
    <header className="border-b border-ink-200 bg-[#f5f3ed]"><div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16"><Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-brand-700"><ArrowLeft size={16}/> All stay guides</Link><div className="mb-5 flex flex-wrap items-center gap-3 text-sm"><span className="text-xs font-semibold uppercase tracking-widest text-brand-800">{post.category}</span><span className="text-ink-500">{post.region}</span></div><h1 className="max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight text-ink-900 sm:text-6xl">{post.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-ink-600">{post.description}</p><p className="mt-6 text-sm text-ink-500">By Ndotoni Stays · <time dateTime={post.date}>7 November 2026</time></p></div></header>
    <figure className="mx-auto max-w-5xl px-4 pt-8 sm:px-6"><div className="relative aspect-[16/10] overflow-hidden sm:aspect-[2/1]"><Image src={photo.src} alt={photo.alt} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover"/></div><figcaption className="mt-3 text-xs text-stone-500">Photography: <Link href={`/property/${photo.id}`} className="underline underline-offset-4">{photo.alt}</Link></figcaption></figure>
    <article className="mx-auto max-w-4xl px-4 pt-10 sm:px-6"><p className="text-xl leading-9 text-ink-700">{post.intro}</p><nav aria-label="In this guide" className="my-8 border-y border-stone-300 py-6"><p className="mb-3 text-sm font-bold text-ink-900">In this guide</p><ol className="list-inside list-decimal space-y-2 text-brand-700">{post.sections.map((s, i) => <li key={s.title}><a href={`#section-${i}`} className="hover:underline">{s.title}</a></li>)}<li><a href="#stays" className="hover:underline">Explore matching listings</a></li></ol></nav>{post.sections.map((s, i) => <section key={s.title} id={`section-${i}`} className="scroll-mt-28 py-5"><h2 className="mb-4 font-serif text-3xl tracking-tight text-ink-900">{s.title}</h2>{s.paragraphs.map(p => <p key={p} className="mb-4 text-base leading-8 text-ink-700">{p}</p>)}</section>)}<aside className="mt-8 border-y border-stone-300 py-7"><h2 className="text-xl font-bold text-brand-900">Make it your trip</h2><p className="mt-2 leading-7 text-ink-600">Choose your dates and guest count to compare listings and check the final booking total.</p><Link href={guideSearchHref(post)} className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800">Search {post.region} <ArrowUpRight size={18}/></Link></aside></article>
    <section id="stays" className="mx-auto mt-16 max-w-7xl scroll-mt-28 px-4 sm:px-6 lg:px-8"><h2 className="text-3xl font-bold tracking-tight text-ink-900">Explore matching listings</h2><p className="mb-7 mt-3 max-w-3xl text-sm leading-7 text-ink-600">{stays.properties.length ? `Sample search for 1 guest, ${stays.checkIn} to ${stays.checkOut}. These listings match the guide’s location and category; they are not ranked by luxury or safety. Confirm facilities, current prices and availability for your own dates.` : 'No matching listings could be loaded for the sample dates. Search your own dates to see current options.'}</p><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{stays.properties.map(p => <PropertyCard key={p.propertyId} property={p} checkIn={stays.checkIn} checkOut={stays.checkOut}/>)}</div><Link href={guideSearchHref(post)} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700">Choose dates and see results <ArrowUpRight size={18}/></Link></section>
    <section className="mx-auto mt-16 max-w-7xl border-t border-ink-200 px-4 pt-10 sm:px-6 lg:px-8"><h2 className="mb-6 text-2xl font-bold text-ink-900">More inspiration for your next stay</h2><div className="grid gap-5 sm:grid-cols-3">{blogPosts.filter(p => p.slug !== post.slug).map(p => <Link key={p.slug} href={`/blog/${p.slug}`} className="border-t border-stone-300 py-6 hover:border-brand-600"><p className="mb-3 text-xs font-semibold text-brand-700">{p.category}</p><h3 className="text-lg font-bold text-ink-900">{p.title}</h3><span className="mt-5 inline-block text-sm font-semibold text-brand-700">Read guide →</span></Link>)}</div></section>
  </div>;
}
