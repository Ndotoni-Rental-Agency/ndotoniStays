'use client';

import { useEffect, useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/graphql/queries';
import { HostCalendar } from '@/components/host/HostCalendar';

interface Property {
  propertyId: string;
  title: string;
  status: string;
}

export default function HostCalendarPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await GraphQLClient.executeAuthenticated<{
          listMyShortTermProperties: { properties: Property[] };
        }>(listMyShortTermProperties, { limit: 50 });
        const props = data.listMyShortTermProperties?.properties || [];
        setProperties(props);
        if (props.length > 0) {
          setSelectedProperty(props[0].propertyId);
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <>
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 mb-6">Calendar</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-ink-100 rounded-xl w-48" />
          <div className="h-64 bg-ink-50 rounded-xl" />
        </div>
      </>
    );
  }

  if (properties.length === 0) {
    return (
      <>
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 mb-6">Calendar</h1>
        <p className="text-ink-500 text-sm">Add a property first to manage its calendar.</p>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900">Calendar</h1>

        {/* Property selector */}
        {properties.length > 1 && (
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="input text-sm py-2 w-auto max-w-[200px] sm:max-w-xs"
          >
            {properties.map((p) => (
              <option key={p.propertyId} value={p.propertyId}>
                {p.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedProperty && (
        <HostCalendar key={selectedProperty} propertyId={selectedProperty} />
      )}
    </>
  );
}
