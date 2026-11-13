'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Cover } from './Cover';

export type GuideCard = { slug: string; title: string; description: string; category: string; date: string; minutes: number; photo?: { src: string; alt: string } };

export function BlogExplorer({ posts }: { posts: GuideCard[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const categories = Array.from(new Set(posts.map(p => p.category)));
  const q = query.trim().toLocaleLowerCase();
  const visible = posts.filter(p => (!category || p.category === category) && `${p.title} ${p.description} ${p.category}`.toLocaleLowerCase().includes(q));
  const pill = (active: boolean) => `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${active ? 'bg-brand-600 text-white' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-100 hover:ring-ink-300'}`;
  return <section aria-label="Guides">
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        {['', ...categories].map(c => <button type="button" key={c || 'all'} aria-pressed={category === c} onClick={() => setCategory(c)} className={pill(category === c)}>{c || 'All'}</button>)}
      </div>
      <label className="flex min-h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-inset ring-ink-100 focus-within:ring-2 focus-within:ring-brand-600 lg:w-80">
        <Search size={18} className="text-ink-500" aria-hidden="true" /><span className="sr-only">Search guides</span>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search guides…" className="w-full min-w-0 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-500" />
      </label>
    </div>
    <p aria-live="polite" className="sr-only">{visible.length} guides</p>
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((p, i) => <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
        <Cover photo={p.photo} label={p.category} index={i} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="mb-5 aspect-[4/3]" />
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-500"><span className="text-brand-700">{p.category}</span><span aria-hidden="true">·</span>{p.minutes} min read</p>
        <h3 className="text-xl font-bold leading-snug tracking-tight text-ink-900 group-hover:text-brand-700">{p.title}</h3>
        <p className="mt-2 line-clamp-3 text-[15px] leading-7 text-ink-500">{p.description}</p>
      </Link>)}
    </div>
    {!visible.length && <div className="rounded-2xl bg-white py-12 text-center ring-1 ring-ink-100">
      <p className="text-ink-700">No guides match your search.</p>
      <button type="button" className="mt-4 font-semibold text-brand-700" onClick={() => { setQuery(''); setCategory(''); }}>Show all guides</button>
    </div>}
  </section>;
}
