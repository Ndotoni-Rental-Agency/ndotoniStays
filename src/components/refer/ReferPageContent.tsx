'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';

export function ReferPageContent() {
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) { setUrl(''); return; }
    let active = true;
    setError('');
    GraphQLClient.executeAuthenticated<{ getMyReferralLink: { code: string; url: string } }>('query GetMyReferralLink { getMyReferralLink { code url } }')
      .then(data => { if (active) setUrl(`https://www.ndotonistays.com/r/${data.getMyReferralLink.code}`); })
      .catch(() => { if (active) setError(sw ? 'Hatukuweza kupata Link yako. Jaribu tena.' : 'We couldn’t load your link. Please try again.'); });
    return () => { active = false; };
  }, [isAuthenticated, sw, retry]);
  const message = sw ? `Una nyumba ya kupangisha? Tangaza kwenye Ndotoni Stays kupitia Link yangu: ${url}` : `Have a short-term stay to list? List it on Ndotoni Stays through my invitation: ${url}`;
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); }
    catch { setError(sw ? 'Chagua Link hapa chini na uunakili.' : 'Select the link below and copy it manually.'); }
  }
  return (
    <main className="bg-[#fbfaf6] text-[#18372b] dark:bg-gray-950 dark:text-white">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialView="signUp" />
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-14">
        <div className="mb-7 flex items-center justify-between border-b border-[#18372b]/20 pb-4 text-[10px] font-bold uppercase tracking-[0.18em] dark:border-white/20 sm:text-xs">
          <span>{sw ? 'Ndotoni Stays / Rafiki kwa rafiki' : 'Ndotoni Stays / Friends of Ndotoni Stays'}</span>
          <span className="text-[#65806e] dark:text-gray-400">{sw ? 'Programu ya rufaa' : 'Referral programme'}</span>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <section>
            <h1 className="max-w-xl !text-[#18372b] text-[44px] font-extrabold leading-[1.02] tracking-[-0.055em] dark:!text-white sm:text-[64px] lg:text-[64px]">
              {sw ? 'Unamfahamu' : 'Know a'}<br />
              {sw ? 'mwenye nyumba?' : 'property owner?'}
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#607166] dark:text-gray-400 sm:text-base">
              {sw ? 'Tuunganishe naye. Msaidie kupata wapangaji, nawe upate zawadi.' : 'Introduce us. Help them find their next guest, and earn a little something for yourself.'}
            </p>
            <div className="mt-7 flex items-center gap-5 border-y border-[#18372b]/20 py-5 dark:border-white/20 sm:mt-8">
              <div className="shrink-0"><span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#607166] dark:text-gray-400">{sw ? 'Hadi TZS' : 'Up to TZS'}</span><span className="text-[48px] font-semibold leading-none tracking-[-0.05em] sm:text-[58px]">25,000<span className="text-brand-600">.</span></span></div>
              <p className="max-w-[180px] border-l border-[#18372b]/20 pl-5 text-xs leading-relaxed dark:border-white/20 sm:text-sm">
                {sw ? 'Kwa wenyeji wapya watano wanaostahili.' : 'For five eligible new hosts.'}
              </p>
            </div>
            <div className="mt-7" aria-labelledby="personal-link">
              <h2 id="personal-link" className="!text-[#18372b] text-base font-bold dark:!text-white">{sw ? 'Link yako. Tuma kwa wote.' : 'Your link. Yours to pass around.'}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#607166] dark:text-gray-400">{sw ? 'Rafiki, jirani, au kikundi cha WhatsApp. Link moja inatosha.' : 'A friend, a neighbour, your WhatsApp group. One link is all you need.'}</p>
              {!isAuthenticated ? (
                <button onClick={() => setShowAuth(true)} className="mt-5 flex min-h-14 w-full items-center justify-between bg-[#18372b] px-5 text-sm font-bold text-white transition hover:bg-[#26503d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 sm:max-w-sm">
                  {sw ? 'Pata Link yangu' : 'Get my personal link'}<ArrowUpRight size={20} />
                </button>
              ) : url ? (
                <>
                  <div className="mt-5 flex items-center gap-2 border border-[#18372b]/25 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                    <input aria-label={sw ? 'Link yako ya rufaa' : 'Your referral link'} readOnly value={url} onFocus={e => e.target.select()} className="min-w-0 flex-1 bg-transparent text-xs text-[#18372b] outline-none dark:text-white sm:text-sm" />
                    <button aria-label={sw ? 'Nakili Link' : 'Copy link'} onClick={copy} className="p-2 text-[#18372b] hover:bg-stone-100 dark:text-white dark:hover:bg-gray-800">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#18372b] px-4 text-sm font-bold text-white transition hover:bg-[#26503d]"><MessageCircle size={18} />{sw ? 'Shiriki WhatsApp' : 'Share on WhatsApp'}</a>
                    <button onClick={copy} className="flex min-h-12 items-center justify-center gap-2 border border-[#18372b]/25 px-4 text-sm font-bold transition hover:bg-stone-100 dark:border-gray-700 dark:hover:bg-gray-900">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? (sw ? 'Imenakiliwa' : 'Copied') : (sw ? 'Nakili Link' : 'Copy link')}</button>
                  </div>
                  <p role="status" className="mt-2 text-xs text-brand-700 dark:text-brand-300">{copied ? (sw ? 'Link yako iko tayari kutumwa.' : 'Ready to send.') : ''}</p>
                </>
              ) : !error ? <p role="status" className="mt-5 text-sm text-[#607166]">{sw ? 'Tunaandaa Link yako…' : 'Getting your link ready…'}</p> : null}
              {error && <div role="alert" className="mt-4 text-sm text-red-700">{error}<button onClick={() => setRetry(n => n + 1)} className="ml-2 font-semibold underline">{sw ? 'Jaribu tena' : 'Retry'}</button></div>}
            </div>
          </section>
          <figure className="hidden pt-2 lg:block">
            {/* Existing Ndotoni Stays property photography. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/property-hero.jpeg" alt={sw ? 'Nyumba yenye bustani na sehemu ya kupumzika' : 'A home with a garden and outdoor space'} className="h-[480px] w-full object-cover object-[35%_center]" />
            <figcaption className="mt-4 flex items-start justify-between gap-5 border-b border-[#18372b]/20 pb-5 dark:border-white/20"><span className="max-w-[240px] text-sm leading-relaxed">{sw ? 'Nyumba nzuri zinapatikana kupitia watu tunaowafahamu.' : 'Good homes often start with someone you know.'}</span><span className="text-xs font-bold uppercase tracking-widest">Ndotoni Stays ↗</span></figcaption>
          </figure>
        </div>
        <p className="mt-7 max-w-2xl text-xs leading-relaxed text-[#607166] dark:text-gray-400">{sw ? 'Shiriki Link yako na watu wengi upendavyo. Zawadi ni kwa wenyeji wapya watano wa kwanza wanaoidhinishwa; rufaa zinazofuata hazina zawadi ya fedha. Kiasi cha zawadi kinathibitishwa baada ya ukaguzi.' : 'Share your link with as many people as you like. Cash rewards cover your first five approved new hosts; further referrals do not earn cash rewards. Your reward amount is confirmed after review.'}</p>
        <section className="mt-12 border-t border-[#18372b]/20 pt-6 dark:border-white/20 lg:mt-16" aria-label={sw ? 'Jinsi inavyofanya kazi' : 'How it works'}>
          <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {[{ title: sw ? 'Tuma Link yako' : 'Pass your link on', text: sw ? 'Hakuna kikomo. Shiriki na wenye nyumba unaowafahamu.' : 'No sharing limit. Send it to property owners you know.' }, { title: sw ? 'Wanatuletea nyumba' : 'They bring the property', text: sw ? 'Wanaanza kwenye tovuti, app au WhatsApp. Tunahifadhi rufaa yako.' : 'Website, app or WhatsApp. We keep your referral attached.' }, { title: sw ? 'Unapata zawadi' : 'You get rewarded', text: sw ? 'Hadi TZS 5,000 kwa kila mwenyeji mpya, baada ya ukaguzi.' : 'Earn up to TZS 5,000 per new host, with the amount confirmed after review.' }].map((step, i) => (
              <li key={step.title} className="flex gap-4"><span className="pt-0.5 text-xs font-semibold text-[#91a192]">0{i + 1}</span><div><h3 className="!text-[#18372b] text-sm font-bold dark:!text-white">{step.title}</h3><p className="mt-2 text-xs leading-relaxed text-[#607166] dark:text-gray-400 sm:text-sm">{step.text}</p></div></li>
            ))}
          </ol>
        </section>
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#18372b]/20 pt-5 text-[11px] leading-relaxed text-[#607166] dark:border-white/20 dark:text-gray-400">
          <p>{sw ? 'Zawadi kwa wenyeji watano wanaostahili. Mwenyeji mmoja, zawadi moja—hata akiwa na nyumba nyingi.' : 'Rewards cover five eligible hosts. One host, one reward—even with multiple units.'} <Link href="/terms#referral-programme" className="underline underline-offset-2">{sw ? 'Masharti' : 'Terms apply'}</Link></p>
          <Link href="/become-host" className="font-semibold underline underline-offset-2">{sw ? 'Tangaza nyumba yako' : 'List your own stay'} ↗</Link>
        </div>
      </div>
    </main>
  );
}
