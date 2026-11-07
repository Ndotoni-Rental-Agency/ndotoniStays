'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Search } from 'lucide-react';
export type GuideCard = { slug: string; title: string; description: string; category: string; date: string; image?: string; imageAlt?: string };
export function BlogExplorer({ posts, sw = false }: { posts: GuideCard[]; sw?: boolean }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const categories = Array.from(new Set(posts.map(p => p.category)));
  const visible = posts.filter(p => (!category || p.category === category) && `${p.title} ${p.description} ${p.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <section aria-label={sw ? 'Makala' : 'Guides'}>
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-ink-200" aria-label={sw ? 'Chuja kwa mada' : 'Filter by topic'}>
        {['', ...categories].map(c => <button type="button" key={c} aria-pressed={category === c} onClick={() => setCategory(c)} className={`-mb-px border-b-2 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 ${category === c ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-900'}`}>{c || (sw ? 'Makala yote' : 'All guides')}</button>)}
      </div>
      <label className="flex items-center gap-2 border-b border-ink-300 py-3 focus-within:border-brand-700 focus-within:ring-1 focus-within:ring-brand-700 lg:w-80"><Search size={18} className="text-ink-500" aria-hidden="true"/><span className="sr-only">{sw ? 'Tafuta makala' : 'Search guides'}</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={sw ? 'Tafuta makala…' : 'Search guides…'} className="min-w-0 w-full bg-transparent text-sm text-ink-900 outline-none"/></label>
    </div>
    <p aria-live="polite" className="mb-4 text-sm text-ink-500">{visible.length} {sw ? 'makala' : visible.length === 1 ? 'guide' : 'guides'}</p>
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{visible.map((p, i) => <Link key={p.slug} href={`/blog/${p.slug}`} className={`group flex flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 ${i === 0 && visible.length > 2 ? 'md:col-span-2' : ''}`}>
      {p.image && <div className={`relative mb-5 overflow-hidden bg-stone-200 ${i === 0 && visible.length > 2 ? 'aspect-[16/9] md:aspect-[2.15/1]' : 'aspect-[4/3]'}`}><Image src={p.image} alt={p.imageAlt || p.title} fill unoptimized sizes={i === 0 ? '(max-width: 767px) 100vw, 66vw' : '(max-width: 767px) 100vw, 33vw'} className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"/></div>}
      <div className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.15em]"><span className="text-brand-800">{p.category}</span><span aria-hidden="true" className="h-px w-6 bg-stone-400"/><time dateTime={p.date} className="text-stone-500">{new Date(p.date + 'T12:00:00Z').toLocaleDateString(sw ? 'sw-TZ' : 'en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></div>
      <h2 className={`font-serif leading-[1.15] tracking-tight text-ink-900 group-hover:text-brand-800 ${i === 0 && visible.length > 2 ? 'text-3xl sm:text-4xl' : 'text-[28px]'}`}>{p.title}</h2><p className="mb-5 mt-3 max-w-xl text-sm leading-7 text-stone-600">{p.description}</p>
      <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-ink-900 underline decoration-stone-300 underline-offset-8 group-hover:decoration-brand-700">{sw ? 'Soma makala' : 'Read the story'}<ArrowUpRight size={16} aria-hidden="true"/></span>
    </Link>)}</div>
    {!visible.length && <div className="border-t border-ink-200 py-12 text-center"><p className="text-ink-600">{sw ? 'Hakuna makala yanayolingana na utafutaji wako.' : 'No guides match your search.'}</p><button className="mt-4 font-semibold text-brand-700" onClick={() => { setQuery(''); setCategory(''); }}>{sw ? 'Onyesha makala yote' : 'Show all guides'}</button></div>}
  </section>;
}
