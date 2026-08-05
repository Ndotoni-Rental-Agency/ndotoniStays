'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { AuthBridge } from '@/lib/auth-bridge';

type Status = 'form' | 'submitting' | 'success' | 'missing-params';

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  const [status, setStatus] = useState<Status>(email && code ? 'form' : 'missing-params');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !code) return;

    setError('');
    setStatus('submitting');

    try {
      await AuthBridge.resetPassword(email, code, newPassword);
      setStatus('success');
    } catch (err: any) {
      setStatus('form');
      setError(err?.message || 'This link may have expired. Request a new password reset to keep going.');
    }
  }

  if (status === 'missing-params') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
          <XCircleIcon className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Invalid reset link</h1>
        <p className="text-ink-500 text-sm mb-6">
          This link is missing some information. Copy the full link from your password reset email, or request a new one.
        </p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Back to ndotoniStays
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Password updated</h1>
        <p className="text-ink-500 text-sm mb-6">You can sign in with your new password now.</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Go to ndotoniStays
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Reset your password</h1>
      <p className="text-sm text-ink-500 mb-6">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          className="input"
          required
          minLength={8}
          disabled={status === 'submitting'}
        />

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
          {status === 'submitting' ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
