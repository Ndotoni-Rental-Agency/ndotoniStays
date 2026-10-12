'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, Copy, Home, MessageCircle, RotateCw, Search, Smartphone, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { CLAIM_REFERRAL, clearPendingReferral, rememberReferral } from '@/lib/referral/attribution';
import { useAuth } from '@/contexts/AuthContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreButtons } from './StoreButtons';

const HERO = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=75&auto=format&fit=crop';
const pill = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]';

export function ReferralWelcome({ code }: { code: string }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<'loading' | 'ready' | 'invalid' | 'error'>('loading');
  const [attributionCode, setAttributionCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [retry, setRetry] = useState(0);
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
        try {
          await GraphQLClient.executeAuthenticated(CLAIM_REFERRAL, { code: firstCode });
          clearPendingReferral();
        } catch {
          // Keep the validated invitation available and retain its code for a later claim.
        }
      }
      if (active) setState('ready');
    }).catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [code, isAuthenticated, retry]);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const invited = state === 'ready' || state === 'error';
  const listHref = invited ? `/become-host?referralCode=${attributionCode}` : '/become-host';
  const whatsapp = `https://wa.me/255790720329?text=${encodeURIComponent(`${sw ? 'Habari! Nimealikwa na rafiki.' : 'Hi! A friend invited me.'}${invited ? `\nReferral: ${attributionCode}` : ''}`)}`;
  async function copyCode() {
    try { await navigator.clipboard.writeText(attributionCode); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  const trust = [
    { icon: BadgeCheck, label: sw ? 'Nyumba zinathibitishwa' : 'Verified listings' },
    { icon: Sparkles, label: sw ? 'Bure kutangaza' : 'Free to list' },
    { icon: MessageCircle, label: sw ? 'Msaada WhatsApp' : 'Help on WhatsApp' },
  ];

  return (
    <main className="bg-white text-ink-900">
      <div className="mx-auto max-w-6xl px-3 pb-14 pt-3 sm:px-6 sm:pb-20 sm:pt-6">
        <section className="relative">
          <div className="relative h-[340px] overflow-hidden rounded-[28px] sm:h-[440px] lg:h-[540px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${HERO}&w=1600`} srcSet={`${HERO}&w=800 800w, ${HERO}&w=1600 1600w, ${HERO}&w=2200 2200w`} sizes="(min-width: 1152px) 1152px, 100vw" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/40 lg:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 pb-16 sm:p-10 sm:pb-20 lg:inset-y-0 lg:flex lg:max-w-xl lg:flex-col lg:justify-center lg:pb-10">
              <h1 className="text-balance text-[2.3rem] font-bold leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl">
                {sw ? 'Karibu ' : 'Welcome to '}<span className="text-brand-400">Ndotoni Stays.</span>
              </h1>
              <p className="mt-3 text-base font-medium text-white/85 sm:text-lg">{state === 'invalid' ? (sw ? 'Malazi mazuri kote Tanzania.' : 'Great places to stay across Tanzania.') : (sw ? 'Rafiki amekualika. Book malazi, au tangaza nyumba yako bure.' : 'A friend invited you. Book a stay, or list your place for free.')}</p>
            </div>
          </div>

          <div aria-live="polite" className="relative z-10 mx-2 -mt-10 rounded-3xl bg-white p-5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:mx-auto sm:max-w-lg sm:p-6 lg:absolute lg:bottom-10 lg:right-10 lg:mt-0 lg:w-[420px]">
            {state === 'loading' ? (
              <div role="status" aria-label={sw ? 'Tunafungua mwaliko wako' : 'Opening your invitation'} className="space-y-3">
                <div className="h-12 animate-pulse rounded-full bg-ink-100" />
                <div className="h-12 animate-pulse rounded-full bg-ink-100" />
              </div>
            ) : (
              <>
                {state !== 'ready' && (
                  <div role="alert" className="mb-4 rounded-2xl bg-ink-50 p-4 text-sm text-ink-700">
                    <p className="font-bold text-ink-900">{state === 'invalid' ? (sw ? 'Link hii ya mwaliko haipo' : 'This invitation Link isn’t valid') : (sw ? 'Hatukuweza kuthibitisha mwaliko' : 'We couldn’t check your invitation')}</p>
                    <p className="mt-1">{state === 'invalid' ? (sw ? 'Bado unaweza kutangaza nyumba yako.' : 'You can still list your place.') : (sw ? 'Endelea; tutauthibitisha ukitangaza.' : 'Carry on; we’ll check it when you list.')}</p>
                    {state === 'error' && (
                      <button type="button" onClick={() => setRetry(n => n + 1)} className="mt-1 inline-flex min-h-10 items-center gap-1.5 font-bold text-ink-900 underline underline-offset-4">
                        <RotateCw size={15} aria-hidden="true" />{sw ? 'Jaribu tena' : 'Try again'}
                      </button>
                    )}
                  </div>
                )}
                <div className="grid gap-2.5">
                  <Link href="/search" className={`${pill} bg-brand-600 text-base text-white hover:bg-brand-700`}>
                    <Search size={18} aria-hidden="true" />{sw ? 'Tafuta malazi' : 'Find a place to stay'}
                  </Link>
                  <Link href={listHref} className={`${pill} border border-ink-200 text-ink-900 hover:bg-ink-50`}>
                    <Home size={18} aria-hidden="true" />{sw ? 'Tangaza nyumba yangu bure' : 'List my place for free'}
                  </Link>
                </div>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mx-auto mt-2 flex min-h-11 w-fit items-center gap-2 px-3 text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                  <WhatsAppIcon className="h-[18px] w-[18px] text-brand-600" />{sw ? 'Au tumia WhatsApp' : 'Or use WhatsApp'}
                </a>
                <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-ink-500">
                  {trust.map(({ icon: Icon, label }) => (
                    <li key={label} className="inline-flex items-center gap-1.5"><Icon size={14} className="text-brand-600" aria-hidden="true" />{label}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        <section className="mx-auto mt-8 grid max-w-5xl gap-3 sm:mt-12 lg:grid-cols-2 lg:gap-4">
          <div className="rounded-3xl bg-ink-50 p-5 sm:p-6">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-ink-900 shadow-sm"><Smartphone size={20} aria-hidden="true" /></span>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{sw ? 'Au tumia app' : 'Or use the app'}</h2>
                <p className="mt-0.5 text-sm text-ink-500">{sw ? 'Simamia nafasi na ujibu wageni popote.' : 'Manage bookings and reply to guests on the go.'}</p>
              </div>
            </div>
            <div className="mt-5"><StoreButtons sw={sw} /></div>
            {invited && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-2 pl-4">
                <span className="min-w-0 text-xs text-ink-500">
                  {sw ? 'Msimbo wako wa mwaliko' : 'Your invitation code'}
                  <code className="block select-all truncate text-sm font-bold tracking-wide text-ink-900">{attributionCode}</code>
                </span>
                <button type="button" onClick={copyCode} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors ${copied ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-900 hover:bg-ink-200'}`}>
                  {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied ? (sw ? 'Imenakiliwa' : 'Copied') : (sw ? 'Nakili' : 'Copy')}
                </button>
              </div>
            )}
            {invited && <p role="status" className="mt-2 text-xs text-ink-500">{copyError ? (sw ? 'Bonyeza msimbo kwa muda kuunakili.' : 'Press and hold the code to copy it.') : (sw ? 'Uweke kwenye “Rufaa” ndani ya app.' : 'Enter it under “Refer” in the app.')}</p>}
          </div>

          <a href={invited ? `https://www.ndotoni.com/r/${attributionCode}` : 'https://www.ndotoni.com/property/create'} className="group flex items-center justify-between gap-4 rounded-3xl border border-ink-200 p-5 transition-colors hover:border-ink-900 sm:p-6">
            <span>
              <span className="block text-lg font-bold tracking-tight">{sw ? 'Unapangisha kwa muda mrefu?' : 'Renting out long-term?'}</span>
              <span className="mt-0.5 block text-sm text-ink-500">{sw ? 'Endelea kwenye Ndotoni.' : 'Continue on Ndotoni.'}</span>
            </span>
            <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </section>

        {state === 'ready' && (
          <p className="mx-auto mt-6 max-w-5xl px-2 text-center text-xs text-ink-500">
            {sw ? 'Mwaliko umehifadhiwa kwa siku 30. ' : 'Your invitation is saved for 30 days. '}
            <Link href="/terms#referral-programme" className="font-semibold underline underline-offset-4">{sw ? 'Masharti' : 'Terms'}</Link>
          </p>
        )}
      </div>
    </main>
  );
}
