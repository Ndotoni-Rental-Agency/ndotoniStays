'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Home, RotateCw, Search, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { CLAIM_REFERRAL, clearPendingReferral, rememberReferral } from '@/lib/referral/attribution';
import { useAuth } from '@/contexts/AuthContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreButtons } from './StoreButtons';

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
  const whatsappFor = (host: boolean) => `https://wa.me/255790720329?text=${encodeURIComponent(
    (host ? (sw ? 'Habari! Nataka kutangaza nyumba yangu kwenye Ndotoni.' : 'Hi! I would like to list my property on Ndotoni.')
      : (sw ? 'Habari! Natafuta malazi Tanzania.' : 'Hi! I am looking for a place to stay in Tanzania.'))
    + (invited ? `\nReferral: ${attributionCode}` : '')
  )}`;
  async function copyCode() {
    try { await navigator.clipboard.writeText(attributionCode); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return (
    <main className="bg-white text-ink-900">
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-7 sm:px-6 sm:py-12">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-800">Ndotoni Stays · Tanzania</p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{sw ? 'Malazi yako yanaanzia hapa.' : 'Your next stay starts here.'}</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{sw ? 'Tafuta malazi au tangaza nyumba yako. Anza kwa kututumia ujumbe WhatsApp.' : 'Find a place to stay or list your property. Start with a message on WhatsApp.'}</p>
        </header>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-2 lg:gap-8">
          <section aria-labelledby="whatsapp-heading" className="rounded-3xl border border-brand-200 bg-brand-50 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-800"><WhatsAppIcon className="h-6 w-6" /></span>
              <div><p className="text-[11px] font-semibold uppercase tracking-wider text-brand-800">{sw ? 'Anza hapa' : 'Start here'}</p><h2 id="whatsapp-heading" className="text-xl font-bold">{sw ? 'Tumia WhatsApp' : 'Continue on WhatsApp'}</h2></div>
            </div>
            <p className="mt-3 hidden text-sm leading-relaxed text-ink-600 sm:block">{sw ? 'Tueleze unachotafuta, tarehe na bajeti yako. Au tutumie maelezo ya nyumba yako ili uitangaze bure.' : 'Tell us your destination, dates and budget. Or send your property details to list it for free.'}</p>
            <div className="mt-5 grid gap-3">
              <a href={whatsappFor(false)} target="_blank" rel="noopener noreferrer" aria-disabled={state === 'loading'} onClick={e => { if (state === 'loading') e.preventDefault(); }} className={`${pill} min-h-14 bg-brand-800 text-base text-white shadow-sm hover:bg-brand-900 aria-disabled:opacity-60`}>
                <WhatsAppIcon className="h-5 w-5" />{sw ? 'Tafuta malazi WhatsApp' : 'Find a stay on WhatsApp'}<ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href={whatsappFor(true)} target="_blank" rel="noopener noreferrer" aria-disabled={state === 'loading'} onClick={e => { if (state === 'loading') e.preventDefault(); }} className={`${pill} border border-brand-200 bg-white text-brand-900 hover:bg-brand-100 aria-disabled:opacity-60`}>
                <Home size={18} aria-hidden="true" />{sw ? 'Tangaza nyumba WhatsApp' : 'List a property on WhatsApp'}
              </a>
            </div>
            <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-sm sm:flex">
              <Link href="/search" className="inline-flex min-h-10 items-center gap-1.5 font-medium text-ink-600 underline underline-offset-4"><Search size={14} aria-hidden="true" />{sw ? 'Tafuta kwenye tovuti' : 'Browse stays online'}</Link>
              <Link href={listHref} className="inline-flex min-h-10 items-center font-medium text-ink-600 underline underline-offset-4">{sw ? 'Tangaza kwenye tovuti' : 'List online'}</Link>
            </div>
          </section>

          <section aria-labelledby="app-heading" className="rounded-3xl border border-ink-200 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-50"><Smartphone size={24} aria-hidden="true" /></span>
              <h2 id="app-heading" className="text-xl font-bold">{sw ? 'Pakua app ya Ndotoni' : 'Download the Ndotoni app'}</h2>
            </div>
            <p className="mb-5 mt-3 text-sm leading-relaxed text-ink-600">{sw ? 'Picha, malazi unayopenda na booking zako sehemu moja.' : 'Photos, favourites and bookings in one place.'}</p>
            <StoreButtons sw={sw} />
            <p className="mt-3 text-center text-xs text-ink-500">{sw ? 'Kwa iPhone na Android' : 'For iPhone and Android'}</p>
            {invited && <details className="mt-5 rounded-2xl border border-ink-100 bg-ink-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold">{sw ? 'Una app tayari? Msimbo wa mwaliko' : 'Already have the app? Invitation code'}</summary>
              <p className="mt-3 text-xs leading-relaxed text-ink-500">{sw ? 'Fungua “Rufaa” kwenye app na uweke msimbo huu wa rafiki yako.' : 'Open “Refer” in the app and enter this code from your friend.'}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <code className="select-all text-sm font-semibold tracking-wide">{attributionCode}</code>
                <button type="button" onClick={copyCode} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold hover:bg-ink-100">{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied ? (sw ? 'Imenakiliwa' : 'Copied') : (sw ? 'Nakili msimbo' : 'Copy code')}</button>
              </div>
              {copyError && <p role="status" className="mt-2 text-xs text-ink-500">{sw ? 'Bonyeza msimbo kwa muda kuunakili.' : 'Press and hold the code to copy it.'}</p>}
            </details>}
          </section>
        </div>

        <div aria-live="polite" className="mt-5 text-sm text-ink-500">
          {state === 'loading' && <p role="status">{sw ? 'Tunafungua mwaliko wako…' : 'Opening your invitation…'}</p>}
          {state === 'ready' && <p>{sw ? 'Mwaliko wa rafiki yako umehifadhiwa.' : 'Your friend’s invitation has been saved.'}</p>}
          {(state === 'invalid' || state === 'error') && <div role="alert" className="rounded-2xl bg-ink-50 p-4">
            <p>{state === 'invalid' ? (sw ? 'Mwaliko huu haupatikani. Bado unaweza kutumia WhatsApp au app.' : 'This invitation isn’t available. You can still use WhatsApp or the app.') : (sw ? 'Hatukuweza kuthibitisha mwaliko. Unaweza kuendelea kwenye WhatsApp.' : 'We couldn’t check your invitation. You can still continue on WhatsApp.')}</p>
            {state === 'error' && <button type="button" onClick={() => setRetry(n => n + 1)} className="mt-2 inline-flex min-h-10 items-center gap-1.5 font-semibold text-ink-700 underline"><RotateCw size={14} aria-hidden="true" />{sw ? 'Jaribu tena' : 'Try again'}</button>}
          </div>}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 text-sm sm:hidden">
          <Link href="/search" className="inline-flex min-h-11 items-center font-medium text-ink-600 underline underline-offset-4">{sw ? 'Tafuta kwenye tovuti' : 'Browse stays online'}</Link>
          <Link href={listHref} className="inline-flex min-h-11 items-center font-medium text-ink-600 underline underline-offset-4">{sw ? 'Tangaza kwenye tovuti' : 'List online'}</Link>
        </div>
        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5 text-xs text-ink-500">
          <a href={invited ? `https://www.ndotoni.com/r/${attributionCode}` : 'https://www.ndotoni.com/property/create'} className="inline-flex min-h-10 items-center gap-2 font-medium underline underline-offset-4">{sw ? 'Unapangisha kwa muda mrefu? Ndotoni' : 'Long-term rentals? Visit Ndotoni'}<ArrowRight size={13} aria-hidden="true" /></a>
          <Link href="/terms#referral-programme" className="inline-flex min-h-10 items-center underline underline-offset-4">{sw ? 'Masharti' : 'Terms'}</Link>
        </footer>
      </div>
    </main>
  );
}
