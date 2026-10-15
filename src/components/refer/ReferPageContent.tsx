'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, Copy, Gift, Home, RotateCw, Share2, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { WhatsAppIcon } from './WhatsAppIcon';

const HERO = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=75&auto=format&fit=crop';
const pill = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-[background-color,border-color,box-shadow,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]';
const primary = 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-1 ring-inset ring-white/15 hover:-translate-y-px hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/35 active:translate-y-0 active:shadow-md';
const secondary = 'border border-ink-300 bg-white text-ink-900 shadow-sm hover:-translate-y-px hover:border-ink-400 hover:bg-ink-50 hover:shadow-md active:translate-y-0 active:shadow-sm';

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
  const [cardVisible, setCardVisible] = useState(true);
  const linkRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'); }, []);
  useEffect(() => {
    if (!cardRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isAuthenticated) { setUrl(''); return; }
    let active = true;
    setFailed(false);
    GraphQLClient.executeAuthenticated<{ getMyReferralLink: { code: string } }>('query GetMyReferralLink { getMyReferralLink { code } }')
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
    ? `Pata malazi mazuri, au tangaza nyumba yako bure, kwenye Ndotoni Stays: ${url}`
    : `Find a great place to stay, or list yours free, on Ndotoni Stays: ${url}`;
  const shareHref = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const whatsappChat = `https://wa.me/255790720329?text=${encodeURIComponent(sw ? 'Pata pesa' : 'My referral Link')}`;

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
    { icon: Share2, label: sw ? 'Tuma Link yako' : 'Share your Link' },
    { icon: Home, label: sw ? 'Wanabook au kutangaza' : 'Friends book or host' },
    { icon: Gift, label: sw ? 'Unalipwa' : 'You get paid' },
  ];
  const trust = [
    { icon: BadgeCheck, title: sw ? 'Kila booking kwa mwaka mmoja' : 'Every booking for a year', text: sw ? 'Rafiki akibook tena, unapata tena' : 'Earn again each time a friend books' },
    { icon: Users, title: sw ? 'Wageni 10 · wenyeji 5' : 'Up to 10 guests · 5 hosts', text: sw ? 'Kwenye Stays, Ndotoni na app' : 'Across Stays, Ndotoni and the app' },
    { icon: ShieldCheck, title: sw ? 'Inakaguliwa na timu yetu' : 'Reviewed by our team', text: sw ? 'Baada ya safari au nyumba ikichapishwa' : 'After the stay, or once their place is live' },
  ];
  const linkReady = isAuthenticated && !!url;

  return (
    <main className="bg-white pb-24 text-ink-900 sm:pb-0">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialView="signUp" />
      <div className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-6">
        <section className="relative">
          <div className="relative h-[400px] overflow-hidden rounded-[28px] sm:h-[460px] lg:h-[540px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${HERO}&w=1600`} srcSet={`${HERO}&w=800 800w, ${HERO}&w=1600 1600w, ${HERO}&w=2200 2200w`} sizes="(min-width: 1152px) 1152px, 100vw" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/40 lg:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 pb-16 sm:p-10 sm:pb-20 lg:inset-y-0 lg:flex lg:max-w-xl lg:flex-col lg:justify-center lg:pb-10">
              <h1 className="text-balance text-[2.3rem] font-bold leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl">
                {sw ? 'Shiriki Link yako.' : 'Share your Link.'}<br />
                <span className="text-brand-400">{sw ? 'Pata pesa.' : 'Get paid.'}</span>
              </h1>
              <dl className="mt-5 max-w-sm divide-y divide-white/20 border-y border-white/20 text-white">
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-white/80">{sw ? 'Rafiki akibook' : 'A friend books'}</dt>
                  <dd className="text-base font-bold">{sw ? 'hadi TZS 10,000' : 'up to TZS 10,000'}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-white/80">{sw ? 'Rafiki akiwa mwenyeji' : 'A friend starts hosting'}</dt>
                  <dd className="text-base font-bold">{sw ? 'hadi TZS 5,000' : 'up to TZS 5,000'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div ref={cardRef} aria-live="polite" className="relative z-10 mx-2 -mt-10 rounded-3xl bg-white p-5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:mx-auto sm:max-w-lg sm:p-6 lg:absolute lg:bottom-10 lg:right-10 lg:mt-0 lg:w-[420px]">
            {isLoading || (isAuthenticated && !url && !failed) ? (
              <div role="status" aria-label={sw ? 'Tunaandaa Link yako' : 'Getting your Link ready'} className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded-full bg-ink-100" />
                <div className="h-12 animate-pulse rounded-full bg-ink-100" />
                <div className="h-12 animate-pulse rounded-full bg-ink-100" />
              </div>
            ) : !isAuthenticated ? (
              <>
                <p className="text-lg font-bold tracking-tight">{sw ? 'Pata Link yako binafsi' : 'Get your personal Link'}</p>
                <p className="mt-1 text-sm text-ink-500">{sw ? 'Bure, na ni yako milele.' : 'Free, and yours to keep.'}</p>
                <div className="mt-4 grid gap-2.5">
                  <a href={whatsappChat} target="_blank" rel="noopener noreferrer" className={`${pill} ${primary} text-base`}>
                    <WhatsAppIcon className="h-5 w-5" />{sw ? 'Pata Link kwenye WhatsApp' : 'Get your Link on WhatsApp'}
                  </a>
                  <p className="text-center text-xs text-ink-500">{sw ? 'Haraka, bila kufungua akaunti.' : 'Fastest, no account needed.'}</p>
                  <button type="button" onClick={() => setShowAuth(true)} className={`${pill} ${secondary}`}>
                    {sw ? 'Au fungua akaunti' : 'Or create an account'}<ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : failed ? (
              <div role="alert">
                <p className="text-lg font-bold tracking-tight">{sw ? 'Link yako haikupatikana' : 'We couldn’t load your Link'}</p>
                <p className="mt-1 text-sm text-ink-500">{sw ? 'Angalia mtandao kisha ujaribu tena.' : 'Check your connection and try again.'}</p>
                <button type="button" onClick={() => setRetry(n => n + 1)} className={`${pill} mt-4 w-full bg-ink-900 text-white shadow-lg shadow-ink-900/25 hover:-translate-y-px hover:bg-ink-800 active:translate-y-0`}>
                  <RotateCw size={16} aria-hidden="true" />{sw ? 'Jaribu tena' : 'Try again'}
                </button>
              </div>
            ) : (
              <>
                <label htmlFor="referral-link" className="text-sm font-bold">{sw ? 'Link yako' : 'Your Link'}</label>
                <div className="mt-2 flex items-center gap-1 rounded-xl border border-ink-200 bg-ink-50 p-1 pl-3.5">
                  <input id="referral-link" ref={linkRef} readOnly value={url.replace('https://www.', '')} onFocus={e => e.target.select()} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink-700 outline-none selection:bg-brand-200" />
                  <button type="button" onClick={copy} className={`${pill} min-h-10 shrink-0 rounded-lg px-3.5 ${copied ? 'bg-brand-100 text-brand-800' : 'bg-white text-ink-900 shadow-sm ring-1 ring-ink-200 hover:bg-ink-100 hover:shadow'}`}>
                    {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    {copied ? (sw ? 'Imenakiliwa' : 'Copied') : (sw ? 'Nakili' : 'Copy')}
                  </button>
                </div>
                <a href={shareHref} target="_blank" rel="noopener noreferrer" className={`${pill} ${primary} mt-3 w-full text-base`}>
                  <WhatsAppIcon className="h-5 w-5" />{sw ? 'Shiriki kwenye WhatsApp' : 'Share on WhatsApp'}
                </a>
                {canShare && (
                  <button type="button" onClick={shareMore} className="mx-auto mt-1 flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                    <Share2 size={16} aria-hidden="true" />{sw ? 'Njia nyingine' : 'More ways to share'}
                  </button>
                )}
                {(copied || copyFailed) && (
                  <p role="status" className="mt-1 text-center text-xs font-medium text-ink-500">
                    {copyFailed ? (sw ? 'Link imechaguliwa. Bonyeza kwa muda kuinakili.' : 'Link selected. Press and hold to copy.') : (sw ? 'Iko tayari kubandikwa popote.' : 'Ready to paste anywhere.')}
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <section aria-label={sw ? 'Inavyofanya kazi' : 'How it works'} className="mx-auto mt-10 max-w-3xl sm:mt-14">
          <ol className="grid grid-cols-3 gap-2">
            {steps.map(({ icon: Icon, label }, i) => (
              <li key={label} className="relative flex flex-col items-center text-center">
                {i > 0 && <span aria-hidden="true" className="absolute top-6 h-px bg-ink-200" style={{ right: 'calc(50% + 28px)', width: 'calc(100% - 56px)' }} />}
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-4 ring-white">
                  <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span className="mt-3 text-sm font-bold leading-tight sm:text-base">{label}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label={sw ? 'Mambo ya kujua' : 'Good to know'} className="mt-10 rounded-3xl bg-ink-50 p-5 sm:mt-14 sm:p-8">
          <ul className="grid gap-5 sm:grid-cols-3 sm:gap-8">
            {trust.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink-900 shadow-sm"><Icon size={19} aria-hidden="true" /></span>
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="mt-0.5 block text-sm text-ink-500">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-ink-200 pt-5 text-sm text-ink-500">
            {sw ? 'Kidokezo: bonyeza “Shiriki” kwenye nyumba yoyote, Link yako itaongezwa. ' : 'Tip: tap “Share” on any stay and your Link is added. '}
            <Link href="/terms#referral-programme" className="font-semibold text-ink-900 underline underline-offset-4">{sw ? 'Masharti' : 'Terms'}</Link>
          </p>
        </section>

        <div className="flex justify-center py-10 sm:py-14">
          <Link href="/become-host" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-ink-900">
            {sw ? 'Una nyumba yako? Itangaze bure' : 'Own a place? List it free'}<ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div aria-hidden={cardVisible} className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 ease-out sm:hidden ${cardVisible || isLoading || failed ? 'translate-y-full' : 'translate-y-0'}`}>
        {linkReady ? (
          <a href={shareHref} target="_blank" rel="noopener noreferrer" tabIndex={cardVisible ? -1 : 0} className={`${pill} ${primary} w-full text-base`}>
            <WhatsAppIcon className="h-5 w-5" />{sw ? 'Shiriki kwenye WhatsApp' : 'Share on WhatsApp'}
          </a>
        ) : (
          <a href={whatsappChat} target="_blank" rel="noopener noreferrer" tabIndex={cardVisible ? -1 : 0} className={`${pill} ${primary} w-full text-base`}>
            <WhatsAppIcon className="h-5 w-5" />{sw ? 'Pata Link kwenye WhatsApp' : 'Get your Link on WhatsApp'}
          </a>
        )}
      </div>
    </main>
  );
}
