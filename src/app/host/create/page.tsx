'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /host/create — redirects to /become-host
 * The create flow now lives outside the /host layout so unauthenticated
 * users can fill out the form before signing in.
 */
export default function HostCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/become-host');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-ink-400">Redirecting...</div>
    </div>
  );
}
