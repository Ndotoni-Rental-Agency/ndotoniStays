'use client';

import { Suspense } from 'react';
import { SearchContent } from '@/components/search/SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-ink-100 rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="h-48 bg-ink-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-ink-100 rounded" />
                <div className="h-3 w-1/2 bg-ink-100 rounded" />
                <div className="h-4 w-1/3 bg-ink-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
