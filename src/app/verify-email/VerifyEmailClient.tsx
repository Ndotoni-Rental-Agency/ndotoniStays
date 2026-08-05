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

  const [status, setStatus] = useState<Status>(email && code ? 'confirming' : 'missing-params');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email || !code) return;

    AuthBridge.verifyEmail(email, code)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setError(err?.message || 'This link may have expired. Try signing up again to get a new one.');
      });
  }, [email, code]);

  if (status === 'confirming') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4 animate-pulse">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Confirming your email…</h1>
        <p className="text-ink-500 text-sm">This only takes a second.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Email confirmed</h1>
        <p className="text-ink-500 text-sm mb-6">Your account is ready. Sign in to get started.</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Go to ndotoniStays
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
        <XCircleIcon className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-ink-900 mb-2">
        {status === 'missing-params' ? 'Invalid confirmation link' : "Couldn't confirm your email"}
      </h1>
      <p className="text-ink-500 text-sm mb-6">
        {status === 'missing-params'
          ? 'This link is missing some information. Copy the full link from your confirmation email, or request a new one.'
          : error}
      </p>
      <button onClick={() => router.push('/')} className="btn-primary">
        Back to ndotoniStays
      </button>
    </div>
  );
}

export default function VerifyEmailClient() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
