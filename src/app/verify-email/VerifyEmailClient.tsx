'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { AuthBridge } from '@/lib/auth-bridge';

type Status = 'confirming' | 'success' | 'error' | 'missing-params';

function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  // Present only when this email was sent to the app: a ndotoniapp:// deep
  // link. Custom URI schemes are often stripped of their href by email
  // clients, so the CTA button always points here (a normal https link)
  // instead, and this page attempts the app redirect itself on load.
  const appLink = searchParams.get('app');

  const [status, setStatus] = useState<Status>(email && code ? 'confirming' : 'missing-params');
  const [error, setError] = useState('');

  useEffect(() => {
    if (appLink) {
      window.location.href = appLink;
    }
  }, [appLink]);

  useEffect(() => {
    if (!email || !code) return;

    AuthBridge.verifyEmail(email, code)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        // The app may have completed verification first (if it opened via
        // the redirect above) — Cognito rejects a second confirm attempt
        // with "already confirmed", which is a success from the user's POV.
        const message = err?.message || '';
        if (/already confirmed|current status is confirmed/i.test(message)) {
          setStatus('success');
          return;
        }
        setStatus('error');
        setError(message || 'This link may have expired. Try signing up again to get a new one.');
      });
  }, [email, code]);

  if (status === 'confirming') {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4 animate-pulse">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">Confirming your email…</h1>
        <p className="text-sm text-ink-500">This only takes a second.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">Email confirmed</h1>
        <p className="text-sm text-ink-500 mb-6">Your account is ready. Sign in to get started.</p>
        <button onClick={() => router.push('/')} className="btn-primary w-full">
          Go to ndotoniStays
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
        <XCircleIcon className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-ink-900 mb-2">
        {status === 'missing-params' ? 'Invalid confirmation link' : "Couldn't confirm your email"}
      </h1>
      <p className="text-sm text-ink-500 mb-6">
        {status === 'missing-params'
          ? 'This link is missing some information. Copy the full link from your confirmation email, or request a new one.'
          : error}
      </p>
      <button onClick={() => router.push('/')} className="btn-primary w-full">
        Back to ndotoniStays
      </button>
    </div>
  );
}

export default function VerifyEmailClient() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <VerifyEmail />
        </Suspense>
      </div>
    </div>
  );
}
