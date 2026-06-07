'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * OAuth callback handler for signInWithRedirect
 * 
 * After Cognito redirects back here with the authorization code,
 * Amplify automatically processes it (exchanges code for tokens).
 * We just need to wait a moment for the session to be established,
 * then redirect to the home page where AuthContext will pick up the session.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Give Amplify a moment to process the OAuth code from the URL
    // Then redirect to home where AuthContext.initializeAuth() will detect the session
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1500);

    return () => clearTimeout(timer);
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
