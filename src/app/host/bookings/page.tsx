'use client';

import { useEffect, useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/graphql/queries';
import { HostBookings } from '@/components/host/HostBookings';

export default function HostBookingsPage() {
  const [propertyIds, setPropertyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await GraphQLClient.executeAuthenticated<{
          listMyShortTermProperties: { properties: Array<{ propertyId: string }> };
        }>(listMyShortTermProperties, { limit: 50 });
        const ids = (data.listMyShortTermProperties?.properties || []).map((p) => p.propertyId);
        setPropertyIds(ids);
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
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 mb-6">Bookings</h1>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-ink-100 rounded-xl p-4 h-24" />
          ))}
        </div>
      ) : (
        <HostBookings propertyIds={propertyIds} />
      )}
    </>
  );
}
