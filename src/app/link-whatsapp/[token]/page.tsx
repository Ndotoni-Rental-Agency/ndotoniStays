'use client';

/**
 * One tap from WhatsApp: the owner signs in (or signs up) and this WhatsApp number — with any
 * listings our team added under it — joins their account. The token in the link says which
 * number; it works once and for 14 days.
 */

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { GraphQLClient } from '@/lib/graphql-client';

const LINK_WHATSAPP = /* GraphQL */ `mutation LinkWhatsAppWithToken($token: String!) {
  linkWhatsAppWithToken(token: $token) { success message }
}`;

const APP_STORE = 'https://apps.apple.com/us/app/ndotoni/id6767931205';
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.ndotoni.app';

type Status = 'signin' | 'linking' | 'done' | 'error';

const COPY = {
  en: {
    appTitle: 'Prefer the app?',
    appBody: 'Install the Ndotoni app, then tap the link in WhatsApp again: it opens in the app.',
    title: 'Link your WhatsApp',
    intro: 'Sign in or create an account to link this WhatsApp number. Your listing will appear in your account, and booking updates will come to you on WhatsApp.',
    signIn: 'Sign in',
    signUp: 'Create an account',
    linking: 'Linking your WhatsApp…',
    done: 'WhatsApp linked',
    goToListings: 'Go to my listings',
    rentalsNote: 'Rentals are managed on ndotoni.com with the same account.',
    failed: "Couldn't link your WhatsApp",
    help: 'Send "unganisha" to our WhatsApp number to get a new link.',
    home: 'Back to ndotoniStays',
  },
  sw: {
    appTitle: 'Unapendelea app?',
    appBody: 'Pakua app ya Ndotoni, kisha bonyeza kiungo kwenye WhatsApp tena: kitafunguka kwenye app.',
    title: 'Unganisha WhatsApp yako',
    intro: 'Ingia au fungua akaunti ili kuunganisha namba hii ya WhatsApp. Nyumba yako itaonekana kwenye akaunti yako, na taarifa za booking zitakuja kwako WhatsApp.',
    signIn: 'Ingia',
    signUp: 'Fungua akaunti',
    linking: 'Tunaunganisha WhatsApp yako…',
    done: 'WhatsApp imeunganishwa',
    goToListings: 'Nenda kwenye nyumba zangu',
    rentalsNote: 'Nyumba za kupanga zinasimamiwa kwenye ndotoni.com kwa akaunti hii hii.',
    failed: 'Hatukuweza kuunganisha WhatsApp yako',
    help: 'Tuma "unganisha" kwenye namba yetu ya WhatsApp upate kiungo kipya.',
    home: 'Rudi ndotoniStays',
  },
};

export default function LinkWhatsAppPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const c = COPY[language === 'sw' ? 'sw' : 'en'];
  const [status, setStatus] = useState<Status>('signin');
  const [message, setMessage] = useState('');
  const [authView, setAuthView] = useState<'signIn' | 'signUp' | null>(null);
  const started = useRef(false);

  // Sign-in with Google/Apple/Facebook leaves the page: come back here afterwards
  useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('ndotoni_booking_redirect', window.location.href);
    }
  }, [isLoading, isAuthenticated]);

  // Signed in: link once
  useEffect(() => {
    if (isLoading || !isAuthenticated || started.current) return;
    started.current = true;
    setAuthView(null);
    setStatus('linking');
    GraphQLClient.executeAuthenticated<{ linkWhatsAppWithToken: { success: boolean; message: string } }>(LINK_WHATSAPP, { token: decodeURIComponent(token) })
      .then((data) => {
        setMessage(data.linkWhatsAppWithToken.message);
        setStatus(data.linkWhatsAppWithToken.success ? 'done' : 'error');
      })
      .catch((err: any) => {
        setMessage(err?.errors?.[0]?.message || err?.message || '');
        setStatus('error');
      })
      .finally(() => {
        if (typeof window !== 'undefined') localStorage.removeItem('ndotoni_booking_redirect');
      });
  }, [isLoading, isAuthenticated, token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-md text-center">
        {(isLoading || status === 'linking') && (
          <>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4 animate-pulse">
              <LinkIcon className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-xl font-bold text-ink-900 mb-2">{c.linking}</h1>
          </>
        )}

        {!isLoading && !isAuthenticated && status === 'signin' && (
          <>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
              <LinkIcon className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-xl font-bold text-ink-900 mb-2">{c.title}</h1>
            <p className="text-sm text-ink-500 mb-6">{c.intro}</p>
            <div className="space-y-3">
              <button onClick={() => setAuthView('signIn')} className="btn-primary w-full">{c.signIn}</button>
              <button onClick={() => setAuthView('signUp')} className="w-full text-sm font-semibold text-brand-700 hover:underline">{c.signUp}</button>
            </div>
            {/* People without the app: install it, and the same WhatsApp link opens there next time */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-ink-900 mb-1">📱 {c.appTitle}</p>
              <p className="text-xs text-ink-500 mb-3">{c.appBody}</p>
              <div className="flex justify-center gap-3">
                <a href={APP_STORE} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-ink-900 hover:bg-gray-50">App Store</a>
                <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-ink-900 hover:bg-gray-50">Google Play</a>
              </div>
            </div>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
              <CheckCircleIcon className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-xl font-bold text-ink-900 mb-2">{c.done}</h1>
            <p className="text-sm text-ink-500 mb-2">{message}</p>
            <p className="text-xs text-ink-400 mb-6">{c.rentalsNote}</p>
            <button onClick={() => router.push('/host')} className="btn-primary w-full">{c.goToListings}</button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-ink-900 mb-2">{c.failed}</h1>
            <p className="text-sm text-ink-500 mb-2">{message}</p>
            <p className="text-sm text-ink-500 mb-6">{c.help}</p>
            <button onClick={() => router.push('/')} className="btn-primary w-full">{c.home}</button>
          </>
        )}
      </div>

      {authView && <AuthModal isOpen onClose={() => setAuthView(null)} initialView={authView} />}
    </div>
  );
}
