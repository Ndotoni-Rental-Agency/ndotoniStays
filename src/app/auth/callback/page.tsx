'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * OAuth callback handler
 * Processes the token from Google/social sign-in and communicates back to the opener
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const state = params.get('state');

    if (accessToken && window.opener) {
      const type = state === 'google' ? 'GOOGLE_AUTH_SUCCESS' : 'FACEBOOK_AUTH_SUCCESS';
      window.opener.postMessage({ type, accessToken }, window.location.origin);
    } else if (window.opener) {
      const type = state === 'google' ? 'GOOGLE_AUTH_ERROR' : 'FACEBOOK_AUTH_ERROR';
      window.opener.postMessage({ type, error: 'No access token received' }, window.location.origin);
    } else {
      // If no opener (e.g., direct navigation), redirect home
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-ink-500">Signing you in...</p>
      </div>
    </div>
  );
}
