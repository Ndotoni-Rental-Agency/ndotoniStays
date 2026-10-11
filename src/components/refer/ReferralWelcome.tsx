'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Copy, MessageCircle, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { CLAIM_REFERRAL, clearPendingReferral, rememberReferral } from '@/lib/referral/attribution';
import { useAuth } from '@/contexts/AuthContext';


export function ReferralWelcome({ code }: { code: string }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<'loading' | 'ready' | 'invalid' | 'error'>('loading');
  const [attributionCode, setAttributionCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [retry, setRetry] = useState(0);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    let active = true;
    setState('loading');
    GraphQLClient.executePublic<{ resolveReferralLink: { code: string } | null }>(
      'query ResolveReferralLink($code: String!) { resolveReferralLink(code: $code) { code } }', { code }
    ).then(async data => {
      if (!active) return;
      if (!data.resolveReferralLink) { setState('invalid'); return; }
      const firstCode = rememberReferral(code) || code;
      setAttributionCode(firstCode);
      if (isAuthenticated) {
        await GraphQLClient.executeAuthenticated(CLAIM_REFERRAL, { code: firstCode });
        clearPendingReferral();
      }
      if (active) setState('ready');
    }).catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [code, isAuthenticated, retry]);
  const whatsapp = `${'https://wa.me/255790720329'}?text=${encodeURIComponent(`${sw ? 'Nataka kutangaza nyumba yangu.' : 'I want to list my short-term stay.'}\nReferral: ${attributionCode}`)}`;
  async function copyCode() {
    try { await navigator.clipboard.writeText(attributionCode); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return (
    <main className="bg-[#fbfaf6] px-5 py-8 text-[#18372b] dark:bg-gray-950 dark:text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between border-b border-[#18372b]/20 pb-4 text-[10px] font-bold uppercase tracking-[0.18em] dark:border-white/20 sm:text-xs"><span>{sw ? 'Ndotoni Stays / Karibu nyumbani' : 'Ndotoni Stays / Make yourself at home'}</span><Link href="/" className="text-[#65806e] dark:text-gray-400">{sw ? 'Kuhusu Ndotoni Stays' : 'Explore Ndotoni Stays'} ↗</Link></div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <section>
            <p className="text-xs font-semibold text-[#65806e] dark:text-gray-400">{sw ? 'Mwaliko kutoka kwa rafiki.' : 'An invitation from a friend.'}</p>
            <h1 className="mt-4 max-w-xl !text-[#18372b] text-[44px] font-extrabold leading-[1.02] tracking-[-0.055em] dark:!text-white sm:text-[64px]">{sw ? 'Nyumba yako.' : 'Your stay.'}<br />{sw ? 'Tuipe nafasi.' : 'Let’s get it seen.'}</h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#607166] dark:text-gray-400">{sw ? 'Picha chache. Taarifa za nyumba. Kisha tutakusaidia kuifikisha kwa watu wanaotafuta nyumba.' : 'A few photos. Your property details. Then we’ll help put it in front of guests looking for a place to stay.'}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/property-hero.jpeg" alt={sw ? 'Nyumba yenye bustani' : 'A home with outdoor space'} className="mt-8 hidden h-64 w-full object-cover object-[35%_center] lg:block" />
          </section>
          <section className="lg:pt-8">
            {state === 'loading' ? (
              <div role="status" className="border-y border-[#18372b]/20 py-10 text-sm text-[#607166] dark:border-white/20">{sw ? 'Tunaandaa mwaliko wako…' : 'Getting your invitation ready…'}</div>
            ) : state !== 'ready' ? (
              <div className="border-y border-[#18372b]/20 py-8 dark:border-white/20">
                <h2 className="!text-[#18372b] text-2xl font-bold dark:!text-white">{state === 'invalid' ? (sw ? 'Link hii haipatikani' : 'This invitation wasn’t found') : (sw ? 'Hatukuweza kufungua mwaliko' : 'We couldn’t open your invitation')}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#607166] dark:text-gray-400">{state === 'invalid' ? (sw ? 'Mwombe rafiki yako akutumie Link yake tena.' : 'Ask your friend to share their personal link again.') : (sw ? 'Angalia mtandao wako na ujaribu tena.' : 'Check your connection and try again.')}</p>
                {state === 'error' && <button onClick={() => setRetry(n => n + 1)} className="mt-6 bg-[#18372b] px-5 py-3 text-sm font-bold text-white hover:bg-[#26503d]">{sw ? 'Jaribu tena' : 'Try again'} ↗</button>}
                <Link href="/become-host" className="mt-5 block text-sm font-semibold underline underline-offset-4">{sw ? 'Endelea kutangaza nyumba' : 'Continue to list a property'} ↗</Link>
              </div>
            ) : (
              <>
                <h2 className="!text-[#18372b] text-xl font-bold tracking-tight dark:!text-white">{sw ? 'Tuanze na nyumba yako.' : 'Start with your property.'}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#607166] dark:text-gray-400">{sw ? 'Chagua njia inayokufaa. Hakuna haja ya kupakua app.' : 'Choose what works for you. No download needed.'}</p>
                <Link href={`/become-host?referralCode=${attributionCode}`} className="mt-6 flex min-h-16 items-center justify-between gap-4 bg-[#18372b] px-5 py-5 text-white transition hover:bg-[#26503d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700">
                  <span className="text-sm font-bold">{sw ? 'Tangaza nyumba yako' : 'List your stay'}<span className="mt-1 block text-xs font-normal text-white/65">{sw ? 'Endelea kwenye tovuti' : 'Continue on the website'}</span></span><ArrowUpRight size={22} />
                </Link>
                <a href={whatsapp} className="mt-3 flex items-center gap-3 border border-[#18372b]/25 px-5 py-5 text-sm font-semibold transition hover:bg-white dark:border-gray-700 dark:hover:bg-gray-900"><MessageCircle size={20} />{sw ? 'Nisaidie kupitia WhatsApp' : 'Help me on WhatsApp'}<ArrowUpRight size={19} className="ml-auto" /></a>
                <a href={`https://www.ndotoni.com/r/${attributionCode}`} className="mt-4 block text-xs font-semibold underline underline-offset-4">{sw ? 'Unatangaza nyumba ya muda mrefu?' : 'Listing a long-term rental?'} ↗</a>
                <details className="mt-6 border-y border-[#18372b]/20 py-5 dark:border-white/20">
                  <summary className="cursor-pointer text-sm font-semibold"><Smartphone size={17} className="mr-2 inline" />{sw ? 'Unapendelea app?' : 'Prefer the app?'}</summary>
                  <div className="mt-5 space-y-4">
                    <a href={`ndotoniapp://r/${attributionCode}`} className="block text-sm font-bold underline underline-offset-4">{sw ? 'Fungua Ndotoni Stays app' : 'Open Ndotoni Stays app'} ↗</a>
                    <div className="flex gap-5 text-xs font-semibold"><a className="underline underline-offset-4" href="https://apps.apple.com/us/app/ndotoni/id6767931205">App Store ↗</a><a className="underline underline-offset-4" href="https://play.google.com/store/apps/details?id=com.ndotoni.app">Google Play ↗</a></div>
                    <p className="text-xs leading-relaxed text-[#607166] dark:text-gray-400">{sw ? 'Baada ya kupakua, rudi hapa kufungua app, au weka msimbo huu kwenye sehemu ya rufaa.' : 'After installing, return here to open the app, or enter this code on its referral screen.'}</p>
                    <button onClick={copyCode} className="flex w-full items-center justify-between border border-[#18372b]/25 bg-white px-3 py-3 text-xs dark:border-gray-700 dark:bg-gray-900"><code>{attributionCode}</code>{copied ? <Check size={16} /> : <Copy size={16} />}<span className="sr-only">{sw ? 'Nakili msimbo' : 'Copy referral code'}</span></button>
                    <p role="status" className="text-xs text-[#607166] dark:text-gray-400">{copyError ? (sw ? 'Chagua msimbo na uunakili.' : 'Select the code and copy it manually.') : copied ? (sw ? 'Msimbo umenakiliwa' : 'Code copied') : ''}</p>
                  </div>
                </details>
                <p className="mt-5 text-xs leading-relaxed text-[#607166] dark:text-gray-400">{sw ? 'Tumepokea rufaa yako. Rafiki aliyekualika anaweza kupata hadi TZS 5,000 kama wewe ni mmoja wa wenyeji wake watano wanaostahili. Kiasi kinathibitishwa baada ya ukaguzi. ' : 'Your referral is saved for this journey. Your friend may earn up to TZS 5,000 if you are one of their five eligible hosts. The amount is confirmed after review. '}<Link href="/terms#referral-programme" className="underline underline-offset-2">{sw ? 'Masharti' : 'Terms apply'}</Link></p>
              </>
            )}
          </section>
        </div>
        <div className="mt-12 border-t border-[#18372b]/20 pt-5 text-[11px] text-[#607166] dark:border-white/20 dark:text-gray-400">{sw ? 'Nyumba yako. Taarifa zako. Njia inayokufaa.' : 'Your stay. Your details. Your way to get started.'}</div>
      </div>
    </main>
  );
}
