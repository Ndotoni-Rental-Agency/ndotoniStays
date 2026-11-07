import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { photography } from './photography';
import { BlogExplorer } from '@/components/blog/BlogExplorer';
import { blogPosts } from './posts';

export const metadata: Metadata = {
  title: 'Stay guides & travel ideas in Tanzania | Ndotoni Stays',
  description: 'Practical guides to short-stay apartments, beach escapes, business travel and celebration venues, with links to real stays in Tanzania.',
  alternates: { canonical: 'https://www.ndotonistays.com/blog' },
  openGraph: { title: 'Find your kind of stay | Ndotoni Stays', description: 'Explore practical stay guides and real places in Tanzania.', url: 'https://www.ndotonistays.com/blog', type: 'website' },
};
export default function BlogPage() {
  const featured = blogPosts[0];
  return <div className="bg-[#f5f3ed] pb-16 text-ink-900">
    <header className="mx-auto max-w-7xl px-5 pt-9 sm:px-8 lg:pt-12">
      <div className="flex items-center justify-between border-b border-stone-300 pb-4 text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-xs"><span>The Stays journal</span><span>Places. People. Tanzania.</span></div>
      <div className="grid items-end gap-6 py-8 md:grid-cols-[1.4fr_1fr] lg:py-10"><h1 className="font-serif text-6xl leading-[0.95] tracking-[-0.045em] sm:text-8xl lg:text-[104px]">A change<br/>of <em className="font-normal text-brand-900">scenery.</em></h1><p className="max-w-sm pb-2 text-base leading-7 text-stone-600 md:justify-self-end">For slow weekends, city visits and trips worth taking. Find your next corner of Tanzania.</p></div>
      <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr] lg:gap-8">
        <figure className="relative"><Link href={`/blog/${featured.slug}`} className="group relative block aspect-[4/3] overflow-hidden sm:aspect-[16/10]"><Image src={photography[0].src} alt={photography[0].alt} fill priority sizes="(max-width: 1023px) 100vw, 65vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"/><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"/><div className="absolute bottom-0 p-6 text-white sm:p-9"><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">The city edit / Dar es Salaam</p><h2 className="max-w-xl font-serif text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl">Check in.<br/>Feel at home.</h2><span className="mt-5 inline-flex items-center gap-3 border-b border-white/50 pb-2 text-sm font-semibold">Your guide to a Dar stay <ArrowUpRight size={17}/></span></div></Link><figcaption className="mt-2 text-[10px] text-stone-500">Photography: <Link href={`/property/${photography[0].id}`} className="underline underline-offset-2">{photography[0].alt}</Link></figcaption></figure>
        <div className="flex flex-col border-t border-stone-300 pt-5 lg:border-t-0 lg:pt-0"><Link href={`/blog/${blogPosts[2].slug}`} className="group"><div className="relative aspect-[2/1] overflow-hidden"><Image src={photography[2].src} alt={photography[2].alt} fill sizes="(max-width:1023px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"/></div><p className="mb-3 mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-900">On the road / Dodoma</p><h2 className="font-serif text-3xl leading-tight tracking-tight">Business trip.<br/>A better base.</h2><p className="mt-3 text-sm leading-7 text-stone-600">A stay that works around your meetings, your schedule, your day.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline decoration-stone-300 underline-offset-8">Read the Dodoma guide <ArrowUpRight size={16}/></span></Link><p className="mt-auto border-t border-stone-300 pt-5 text-xs leading-6 text-stone-500 lg:mt-6">Real places from the Ndotoni Stays collection. Practical advice for choosing yours.</p></div>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8"><div className="mb-7 flex items-baseline justify-between border-b border-stone-300 pb-5"><h2 className="font-serif text-4xl tracking-tight sm:text-5xl">Where to next?</h2><span className="hidden text-xs uppercase tracking-widest text-stone-500 sm:block">The latest stories</span></div><BlogExplorer posts={blogPosts.map((p,i) => ({...p, image: photography[i % photography.length].src, imageAlt: photography[i % photography.length].alt}))}/><aside className="mt-16 grid gap-6 bg-[#183e31] p-8 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-10"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5debe]">Make room for a little adventure</p><h2 className="font-serif text-3xl text-white sm:text-4xl">Find somewhere that feels like you.</h2></div><Link href="/search" className="inline-flex items-center gap-3 border-b border-white/50 pb-2 text-sm font-semibold">Explore the stays <ArrowUpRight size={18}/></Link></aside><a href="https://www.ndotoni.com/blog" className="mt-8 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-brand-900">Staying longer? Read our rental journal <ArrowUpRight size={16}/></a></div>
  </div>;
}
