'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /list-your-place now redirects to /host/create
 * All property listing goes through the authenticated host flow.
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
