'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /host/create — redirects to /become-host (the standalone create form)
 * Works for both authenticated and unauthenticated users.
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
