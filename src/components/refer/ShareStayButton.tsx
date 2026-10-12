'use client';
import { useEffect, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';

let cachedCode: Promise<string | undefined> | undefined;
function myLinkCode() {
  cachedCode ||= GraphQLClient.executeAuthenticated<{ getMyReferralLink: { code: string } }>('query GetMyReferralLink { getMyReferralLink { code } }')
    .then(data => data.getMyReferralLink.code)
    .catch(() => { cachedCode = undefined; return undefined; });
  return cachedCode;
}

/** Shares a stay. Signed-in people share it with their Link, so they're rewarded when a friend books. */
export function ShareStayButton({ propertyId, title }: { propertyId: string; title: string }) {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 3000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function share() {
    const code = isAuthenticated ? await myLinkCode() : undefined;
    const url = `https://www.ndotonistays.com/property/${propertyId}${code ? `?ref=${code}` : ''}`;
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, text: title, url }); return; }
      catch (error) { if ((error as Error).name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); setStatus('copied'); }
    catch { setStatus('failed'); }
  }

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
        {status === 'copied' ? <Check size={16} className="text-brand-600" aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
        {status === 'copied' ? (sw ? 'Imenakiliwa' : 'Copied') : (sw ? 'Shiriki' : 'Share')}
      </button>
      <p role="status" className="absolute right-0 top-full z-10 mt-2 w-60 text-right text-xs text-ink-500">
        {status === 'copied' && isAuthenticated ? (sw ? 'Link yako imo. Rafiki akibook, unapata zawadi.' : 'Your Link is included. Earn when a friend books.') : status === 'failed' ? (sw ? 'Nakili anwani kwenye kivinjari.' : 'Copy the address from your browser.') : ''}
      </p>
    </div>
  );
}
