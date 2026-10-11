'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, RotateCw, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { WhatsAppIcon } from './WhatsAppIcon';

const button = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]';

export function ReferPageContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'); }, []);
  useEffect(() => {
    if (!isAuthenticated) { setUrl(''); return; }
    let active = true;
    setFailed(false);
    GraphQLClient.executeAuthenticated<{ getMyReferralLink: { code: string; url: string } }>('query GetMyReferralLink { getMyReferralLink { code url } }')
      .then(data => { if (active) setUrl(`https://www.ndotonistays.com/r/${data.getMyReferralLink.code}`); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [isAuthenticated, retry]);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const message = sw
    ? `Una nyumba ya kukodisha kwa muda mfupi? Itangaze bure kwenye Ndotoni Stays kupitia Link yangu: ${url}`
    : `Have a place for short stays? List it free on Ndotoni Stays with my Link: ${url}`;
  const whatsappChat = `https://wa.me/255790720329?text=${encodeURIComponent(sw ? 'Pata pesa' : 'Referral')}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      linkRef.current?.select();
      setCopyFailed(true);
    }
  }
  async function shareMore() {
    try { await navigator.share({ text: message }); } catch { /* Cancelled by the user. */ }
  }

  const steps = [
    { title: sw ? 'Tuma Link yako' : 'Send your Link', text: sw ? 'Kwa rafiki, jirani au kikundi cha WhatsApp. Hakuna kikomo.' : 'To a friend, a neighbour or a WhatsApp group. No limit.' },
    { title: sw ? 'Wanatangaza nyumba' : 'They list their place', text: sw ? 'Kwenye tovuti, app au WhatsApp. Rufaa yako inabaki nao kwa siku 30.' : 'On the website, app or WhatsApp. Your referral stays with them for 30 days.' },
    { title: sw ? 'Unapata zawadi' : 'You get rewarded', text: sw ? 'Nyumba ikithibitishwa na kuchapishwa, tunakagua na kuthibitisha zawadi yako.' : 'Once their place is verified and published, we review it and confirm your reward.' },
  ];
  const facts = [
    { title: sw ? 'Wenyeji watano wa kwanza' : 'Your first five hosts', text: sw ? 'Zawadi za fedha ni kwa wenyeji wapya watano wa kwanza wanaoidhinishwa, kwenye Ndotoni, Ndotoni Stays na app. Unaweza kuendelea kushiriki baada ya hapo, bila zawadi ya fedha.' : 'Cash rewards cover your first five approved new hosts across Ndotoni, Ndotoni Stays and the app. Keep sharing after that; further referrals don’t earn cash.' },
    { title: sw ? 'Zawadi moja kwa kila mwenyeji' : 'One reward per host', text: sw ? 'Hata akitangaza nyumba au vyumba vingi, mwenyeji mmoja ni zawadi moja.' : 'However many properties or units they list, each host counts once.' },
    { title: sw ? 'Kiasi kinathibitishwa' : 'Amount confirmed on review', text: sw ? 'Hadi TZS 5,000 kwa kila mwenyeji. Tunathibitisha kiasi baada ya nyumba kuthibitishwa na kuchapishwa.' : 'Up to TZS 5,000 per host. We confirm the amount once their place is verified and published.' },
  ];

  return (
    <main className="bg-white text-ink-900">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialView="signUp" />
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-8">
        <section className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="relative flex min-h-[18rem] overflow-hidden rounded-2xl sm:min-h-[22rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/property-hero.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover object-[35%_center]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />
            <div className="relative mt-auto p-6 sm:p-8">
              <h1 className="max-w-md text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {sw ? 'Unamfahamu mwenye nyumba?' : 'Know someone with a place for guests?'}
              </h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-white/90">
                {sw ? 'Mtumie Link yako. Akiwa mwenyeji mpya, unapata zawadi.' : 'Send them your Link. When they become a new host, you get rewarded.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-ink-100 bg-ink-50 p-5 sm:p-8">
            <p className="text-lg font-semibold text-ink-900">
              {sw ? 'Pata hadi ' : 'Earn up to '}<span className="whitespace-nowrap text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">TZS 25,000</span>
            </p>
            <p className="mt-1 text-sm text-ink-600">{sw ? 'Hadi TZS 5,000 kwa kila mmoja wa wenyeji wako wapya watano wa kwanza.' : 'Up to TZS 5,000 for each of your first five new hosts.'}</p>

            <div className="mt-6 rounded-xl border border-ink-100 bg-white p-4 shadow-sm sm:p-5" aria-live="polite">
              {isLoading || (isAuthenticated && !url && !failed) ? (
                <div role="status" aria-label={sw ? 'Tunaandaa Link yako' : 'Getting your Link ready'} className="space-y-3">
                  <div className="h-12 animate-pulse rounded-xl bg-ink-100" />
                  <div className="h-12 animate-pulse rounded-xl bg-ink-100" />
                </div>
              ) : !isAuthenticated ? (
                <>
                  <p className="text-base font-semibold">{sw ? 'Pata Link yako binafsi' : 'Get your personal Link'}</p>
                  <p className="mt-1 text-sm text-ink-500">{sw ? 'Ni bure. Link moja kwa watu wote unaowafahamu.' : 'It’s free. One Link for everyone you know.'}</p>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <button type="button" onClick={() => setShowAuth(true)} className={`${button} bg-brand-600 text-white hover:bg-brand-700`}>
                      {sw ? 'Pata Link yangu' : 'Get my Link'}<ArrowRight size={17} aria-hidden="true" />
                    </button>
                    <a href={whatsappChat} target="_blank" rel="noopener noreferrer" className={`${button} border border-ink-200 text-ink-700 hover:bg-ink-50`}>
                      <WhatsAppIcon className="h-[18px] w-[18px] text-brand-600" />{sw ? 'Ipate WhatsApp' : 'Get it on WhatsApp'}
                    </a>
                  </div>
                  <p className="mt-3 text-xs text-ink-500">{sw ? 'Kwenye WhatsApp hakuna haja ya kufungua akaunti.' : 'No account needed on WhatsApp.'}</p>
                </>
              ) : failed ? (
                <div role="alert">
                  <p className="text-base font-semibold">{sw ? 'Hatukuweza kupata Link yako' : 'We couldn’t load your Link'}</p>
                  <p className="mt-1 text-sm text-ink-500">{sw ? 'Angalia mtandao wako kisha ujaribu tena.' : 'Check your connection and try again.'}</p>
                  <button type="button" onClick={() => setRetry(n => n + 1)} className={`${button} mt-4 w-full bg-brand-600 text-white hover:bg-brand-700 sm:w-auto`}>
                    <RotateCw size={16} aria-hidden="true" />{sw ? 'Jaribu tena' : 'Try again'}
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="referral-link" className="text-sm font-semibold">{sw ? 'Link yako' : 'Your Link'}</label>
                  <div className="mt-2 flex items-center gap-1 rounded-xl border border-ink-200 bg-ink-50 p-1 pl-3.5">
                    <input id="referral-link" ref={linkRef} readOnly value={url} onFocus={e => e.target.select()} className="min-w-0 flex-1 bg-transparent text-sm text-ink-700 outline-none selection:bg-brand-200" />
                    <button type="button" onClick={copy} className={`${button} min-h-10 shrink-0 rounded-lg px-3.5 ${copied ? 'bg-brand-50 text-brand-800' : 'bg-white text-ink-900 shadow-sm hover:bg-ink-100'}`}>
                      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                      {copied ? (sw ? 'Imenakiliwa' : 'Copied') : (sw ? 'Nakili' : 'Copy')}
                    </button>
                  </div>
                  <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={`${button} mt-3 w-full bg-brand-600 text-white hover:bg-brand-700`}>
                    <WhatsAppIcon className="h-5 w-5" />{sw ? 'Shiriki kwenye WhatsApp' : 'Share on WhatsApp'}
                  </a>
                  {canShare && (
                    <button type="button" onClick={shareMore} className="mx-auto mt-2 flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-ink-600 underline-offset-4 hover:underline">
                      <Share2 size={16} aria-hidden="true" />{sw ? 'Njia nyingine za kushiriki' : 'More ways to share'}
                    </button>
                  )}
                  <p role="status" className="min-h-[1.25rem] text-center text-xs font-medium text-ink-500">
                    {copyFailed ? (sw ? 'Link imechaguliwa. Bonyeza kwa muda kuinakili.' : 'Link selected. Press and hold, or use Ctrl+C, to copy.') : copied ? (sw ? 'Iko tayari kubandikwa popote.' : 'Ready to paste anywhere.') : ''}
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-14 sm:mt-20" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-3xl font-semibold tracking-tight">{sw ? 'Inavyofanya kazi' : 'How it works'}</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4 sm:block">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{i + 1}</span>
                <div className="sm:mt-4">
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-500">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 border-t border-ink-100 pt-10 sm:mt-20" aria-labelledby="good-to-know">
          <h2 id="good-to-know" className="text-2xl font-semibold tracking-tight">{sw ? 'Mambo ya kujua' : 'Good to know'}</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {facts.map(item => (
              <div key={item.title}>
                <dt className="text-sm font-semibold">{item.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink-500">{item.text}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
            <Link href="/terms#referral-programme" className="text-brand-700 underline underline-offset-4 hover:text-brand-800">{sw ? 'Masharti kamili ya programu' : 'Full programme terms'}</Link>
            <Link href="/become-host" className="inline-flex items-center gap-1.5 text-ink-600 hover:text-ink-900">{sw ? 'Una nyumba yako? Itangaze' : 'Own a place? List it yourself'}<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
