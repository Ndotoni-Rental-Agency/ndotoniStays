import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { BlogExplorer } from '@/components/blog/BlogExplorer';
import { Cover } from '@/components/blog/Cover';
import { stayCategoryLabel } from '@/lib/stay-categories';
import { blogPosts, readingMinutes, guideSearchHref } from './posts';
import { photography } from './photography';

export const metadata: Metadata = {
  title: 'Stay guides & travel ideas in Tanzania | Ndotoni Stays',
  description: 'Practical guides to short stays, monthly apartments, beach escapes, business trips, safari bases, party venues, photoshoot and meeting spaces in Tanzania.',
  alternates: { canonical: 'https://www.ndotonistays.com/blog' },
  openGraph: { title: 'Stay guides | Ndotoni Stays', description: 'Practical guides and real places to stay in Tanzania.', url: 'https://www.ndotonistays.com/blog', type: 'website', images: [{ url: photography[0].src, alt: photography[0].alt }] },
};

export default function BlogPage() {
  const [lead, ...rest] = blogPosts;
  const occasions = Array.from(new Map(blogPosts.map(p => [p.stayCategory + p.region, p])).values());
  return <div className="bg-ink-50 pb-20 text-ink-900">
    <header className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Stay guides</p>
      <div className="mt-4 grid gap-4 md:grid-cols-[1.5fr_1fr] md:items-end">
        <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl">Plan the stay,<span className="block text-brand-600">enjoy the trip.</span></h1>
        <p className="max-w-md text-base leading-7 text-ink-500 md:justify-self-end">Practical checklists for city breaks, longer stays, business trips and celebrations across Tanzania — with real places to book.</p>
      </div>

      <Link href={`/blog/${lead.slug}`} className="group mt-10 grid overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100 transition-shadow hover:shadow-xl hover:shadow-ink-900/5 lg:grid-cols-[1.4fr_1fr]">
        <Cover photo={photography[lead.photo!]} label={lead.category} index={0} priority sizes="(max-width: 1023px) 100vw, 60vw" className="aspect-[16/10] rounded-none lg:aspect-auto lg:min-h-[420px]" />
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Featured · {lead.region}</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight group-hover:text-brand-700 sm:text-4xl">{lead.title}</h2>
          <p className="mt-4 leading-7 text-ink-500">{lead.description}</p>
          <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-brand-700">Read the guide <ArrowRight size={16} aria-hidden="true" /></span>
        </div>
      </Link>

      <nav aria-label="Browse stays by occasion" className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-6">
        <p className="mb-4 text-sm font-semibold">Already know what you need? Jump straight to the stays.</p>
        <ul className="flex flex-wrap gap-2">
          {occasions.map(p => <li key={p.slug}><Link href={guideSearchHref(p)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink-50 px-4 text-sm font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700">{stayCategoryLabel(p.stayCategory)} · {p.region}<ArrowUpRight size={14} aria-hidden="true" /></Link></li>)}
        </ul>
      </nav>
    </header>

    <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">All guides</h2>
      <BlogExplorer posts={rest.map(p => ({ slug: p.slug, title: p.title, description: p.description, category: p.category, date: p.updated || p.date, minutes: readingMinutes(p), photo: p.photo === undefined ? undefined : photography[p.photo] }))} />

      <aside className="mt-20 flex flex-col gap-6 rounded-3xl bg-brand-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">Make room for a little adventure</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Find somewhere that feels like you.</h2>
        </div>
        <Link href="/search" className="inline-flex w-fit flex-none items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-500">Explore stays <ArrowRight size={18} aria-hidden="true" /></Link>
      </aside>
      <a href="https://www.ndotoni.com/blog" className="mt-8 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-700">Staying longer? Read our rental guides on ndotoni.com <ArrowUpRight size={16} aria-hidden="true" /></a>
    </div>
  </div>;
}
