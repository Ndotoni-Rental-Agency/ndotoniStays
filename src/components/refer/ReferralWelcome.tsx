'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Copy, RotateCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { CLAIM_REFERRAL, clearPendingReferral, rememberReferral } from '@/lib/referral/attribution';
import { useAuth } from '@/contexts/AuthContext';
import { WhatsAppIcon } from './WhatsAppIcon';

const button = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]';

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

  const invited = state === 'ready' || state === 'error';
  const listHref = invited ? `/become-host?referralCode=${attributionCode}` : '/become-host';
  const whatsapp = `https://wa.me/255790720329?text=${encodeURIComponent(`${sw ? 'Nataka kutangaza nyumba yangu ya muda mfupi.' : 'I want to list my short-term stay.'}${invited ? `\nReferral: ${attributionCode}` : ''}`)}`;
  async function copyCode() {
    try { await navigator.clipboard.writeText(attributionCode); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }

  return (
    <main className="bg-white text-ink-900">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-8">
        <section className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="relative flex min-h-[18rem] overflow-hidden rounded-2xl sm:min-h-[22rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/property-hero.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover object-[35%_center]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />
            <div className="relative mt-auto p-6 sm:p-8">
              <h1 className="max-w-md text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {sw ? 'Karibisha wageni kwenye nyumba yako.' : 'Welcome guests to your place.'}
              </h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-white/90">
                {sw ? 'Rafiki amekualika kwenye Ndotoni Stays. Kutangaza ni bure.' : 'A friend invited you to Ndotoni Stays. Listing is free.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-ink-100 bg-ink-50 p-5 sm:p-8" aria-live="polite">
            <h2 className="text-xl font-semibold tracking-tight">{sw ? 'Anza na nyumba yako' : 'Start with your place'}</h2>
            <p className="mt-1 text-sm text-ink-600">{sw ? 'Picha chache na taarifa za msingi. Hakuna haja ya kupakua app.' : 'A few photos and the basics. No download needed.'}</p>
            {state === 'loading' ? (
              <div role="status" aria-label={sw ? 'Tunafungua mwaliko wako' : 'Opening your invitation'} className="mt-5 space-y-2.5">
                <div className="h-12 animate-pulse rounded-xl bg-ink-200" />
                <div className="h-12 animate-pulse rounded-xl bg-ink-100" />
              </div>
            ) : (
              <>
                {state !== 'ready' && (
                  <div role="alert" className="mt-5 rounded-xl border border-ink-200 bg-white p-4 text-sm text-ink-700">
                    <p className="font-semibold text-ink-900">
                      {state === 'invalid' ? (sw ? 'Link hii ya mwaliko haipo' : 'This invitation Link isn’t valid') : (sw ? 'Hatukuweza kuthibitisha mwaliko' : 'We couldn’t check your invitation')}
                    </p>
                    <p className="mt-1">
                      {state === 'invalid'
                        ? (sw ? 'Mwombe rafiki yako akutumie Link yake tena. Bado unaweza kutangaza nyumba yako.' : 'Ask your friend to send their Link again. You can still list your place.')
                        : (sw ? 'Unaweza kuendelea; tutathibitisha mwaliko ukitangaza.' : 'You can carry on; we’ll check the invitation when you list.')}
                    </p>
                    {state === 'error' && (
                      <button type="button" onClick={() => setRetry(n => n + 1)} className="mt-2 inline-flex min-h-10 items-center gap-1.5 font-semibold text-brand-700 underline underline-offset-4">
                        <RotateCw size={15} aria-hidden="true" />{sw ? 'Jaribu tena' : 'Try again'}
                      </button>
                    )}
                  </div>
                )}
                <div className="mt-5 grid gap-2.5">
                  <Link href={listHref} className={`${button} bg-brand-600 text-base text-white hover:bg-brand-700`}>
                    {sw ? 'Tangaza nyumba yangu' : 'List my place'}<ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${button} border border-ink-200 bg-white text-ink-700 hover:bg-ink-50`}>
                    <WhatsAppIcon className="h-[18px] w-[18px] text-brand-600" />{sw ? 'Nisaidie kupitia WhatsApp' : 'Get help on WhatsApp'}
                  </a>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-2 lg:gap-4">
          <div className="space-y-3">
            <a href={invited ? `https://www.ndotoni.com/r/${attributionCode}` : 'https://www.ndotoni.com/property/create'} className="group flex items-center justify-between gap-4 rounded-xl border border-ink-100 p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/50">
              <span>
                <span className="block text-base font-semibold">{sw ? 'Ni nyumba ya kupangisha kwa muda mrefu?' : 'Renting out long-term?'}</span>
                <span className="mt-0.5 block text-sm text-ink-500">{sw ? 'Kwa wapangaji wa kila mwezi, endelea kwenye Ndotoni.' : 'For monthly tenants, continue on Ndotoni.'}</span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-ink-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>

            {invited && (
              <details className="group rounded-xl border border-ink-100">
                <summary className="flex min-h-[4.25rem] cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block text-base font-semibold">{sw ? 'Unapendelea app?' : 'Prefer the app?'}</span>
                    <span className="mt-0.5 block text-sm text-ink-500">{sw ? 'Hiari. Mwaliko wako unaenda nawe.' : 'Optional. Your invitation comes with you.'}</span>
                  </span>
                  <ChevronDown size={18} className="shrink-0 text-ink-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="space-y-4 border-t border-ink-100 p-5">
                  <div className="flex flex-wrap gap-2">
                    <a href={`ndotoniapp://r/${attributionCode}`} className={`${button} min-h-11 bg-brand-600 text-white hover:bg-brand-700`}>{sw ? 'Fungua app' : 'Open the app'}</a>
                    <a href="https://apps.apple.com/us/app/ndotoni/id6767931205" className={`${button} min-h-11 border border-ink-200 text-ink-700 hover:bg-ink-50`}>App Store</a>
                    <a href="https://play.google.com/store/apps/details?id=com.ndotoni.app" className={`${button} min-h-11 border border-ink-200 text-ink-700 hover:bg-ink-50`}>Google Play</a>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-500">{sw ? 'Ukishapakua, rudi hapa ubonyeze “Fungua app”, au weka msimbo huu kwenye ukurasa wa rufaa ndani ya app.' : 'After installing, come back and tap “Open the app”, or enter this code on the app’s referral screen.'}</p>
                  <button type="button" onClick={copyCode} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50 pl-4 pr-1.5 text-sm">
                    <code className="select-all font-semibold tracking-wide">{attributionCode}</code>
                    <span className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${copied ? 'bg-brand-50 text-brand-800' : 'bg-white text-ink-900 shadow-sm'}`}>
                      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied ? (sw ? 'Imenakiliwa' : 'Copied') : (sw ? 'Nakili msimbo' : 'Copy code')}
                    </span>
                  </button>
                  {copyError && <p role="status" className="text-xs text-ink-500">{sw ? 'Bonyeza msimbo kwa muda kuunakili.' : 'Press and hold the code to copy it.'}</p>}
                </div>
              </details>
            )}
          </div>
          {state === 'ready' && (
            <p className="text-sm leading-relaxed text-ink-500 lg:pl-4">
              {sw ? 'Mwaliko wako umehifadhiwa kwa siku 30. Rafiki aliyekualika anaweza kupata zawadi nyumba yako ikithibitishwa na kuchapishwa. ' : 'Your invitation is saved for 30 days. The friend who invited you may be rewarded once your place is verified and published. '}
              <Link href="/terms#referral-programme" className="font-semibold text-ink-700 underline underline-offset-4">{sw ? 'Masharti' : 'Terms'}</Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
