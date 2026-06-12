'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /list-your-place redirects to /host/create
 * Auth is no longer required upfront — users fill the form first,
 * then sign in at submission time.
 */
export default function ListYourPlacePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/host/create');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-ink-400">Redirecting...</div>
    </div>
  );
}
