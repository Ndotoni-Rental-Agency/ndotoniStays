'use client';

import { useEffect, useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/graphql/queries';
import { HostReviews } from '@/components/host/HostReviews';

export default function HostReviewsPage() {
  const [propertyIds, setPropertyIds] = useState<string[]>([]);
  const [propertyMap, setPropertyMap] = useState<Record<string, string>>({});
  const [thumbnailMap, setThumbnailMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await GraphQLClient.executeAuthenticated<{
          listMyShortTermProperties: { properties: Array<{ propertyId: string; title: string; thumbnail: string }> };
        }>(listMyShortTermProperties, { limit: 50 });
        const properties = data.listMyShortTermProperties?.properties || [];
        setPropertyIds(properties.map((p) => p.propertyId));
        setPropertyMap(Object.fromEntries(properties.map((p) => [p.propertyId, p.title])));
        setThumbnailMap(Object.fromEntries(properties.filter((p) => p.thumbnail).map((p) => [p.propertyId, p.thumbnail])));
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <>
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 mb-6">Reviews</h1>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-ink-100 rounded-xl p-4 h-24" />
          ))}
        </div>
      ) : (
        <HostReviews propertyIds={propertyIds} propertyNames={propertyMap} propertyThumbnails={thumbnailMap} />
      )}
    </>
  );
}
