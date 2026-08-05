'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { AuthBridge } from '@/lib/auth-bridge';

type Status = 'form' | 'submitting' | 'success' | 'missing-params';

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  const [status, setStatus] = useState<Status>(email && code ? 'form' : 'missing-params');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !code) return;

    if (newPassword !== confirmNewPassword) {
      setError("Passwords don't match.");
      return;
    }

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
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
          <XCircleIcon className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">Invalid reset link</h1>
        <p className="text-sm text-ink-500 mb-6">
          This link is missing some information. Copy the full link from your password reset email, or request a new one.
        </p>
        <button onClick={() => router.push('/')} className="btn-primary w-full">
          Back to ndotoniStays
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">Password updated</h1>
        <p className="text-sm text-ink-500 mb-6">You can sign in with your new password now.</p>
        <button onClick={() => router.push('/')} className="btn-primary w-full">
          Go to ndotoniStays
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold text-ink-900 mb-1">Reset your password</h1>
      <p className="text-sm text-ink-500 mb-6">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="input pr-11"
              minLength={8}
              disabled={status === 'submitting'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Confirm New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm new password"
            className="input"
            minLength={8}
            disabled={status === 'submitting'}
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
          {status === 'submitting' ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordClient() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <ResetPassword />
        </Suspense>
      </div>
    </div>
  );
}
