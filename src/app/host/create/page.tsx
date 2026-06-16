'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /host/create — redirects to /host
 * The /host page shows the create flow for unauthenticated users
 * and the dashboard for authenticated hosts.
 */
export default function HostCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/host');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-ink-400">Redirecting...</div>
    </div>
  );
}
