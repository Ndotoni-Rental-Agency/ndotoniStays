'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ChevronUpIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';

const LeafletMap = dynamic(() => import('./LeafletMapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-ink-100 rounded-xl" />,
});

interface Props {
  lat: number;
  lng: number;
  title?: string;
}

export function PropertyLocationMap({ lat, lng, title }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!lat || !lng || (lat === 0 && lng === 0)) return null;

  return (
    <>
      {/* Section */}
      <div className="border-t border-ink-100 pt-8 mt-8">
        <h3 className="text-lg font-semibold text-ink-900 mb-4">Location</h3>

        <div
          className="relative h-[300px] rounded-xl overflow-hidden border border-ink-200 cursor-pointer group"
          onClick={() => setExpanded(true)}
        >
          <LeafletMap lat={lat} lng={lng} />

          {/* Expand hint */}
          <button
            className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-lg shadow-md border border-ink-200 opacity-70 group-hover:opacity-100 transition-opacity z-[400]"
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            aria-label="Expand map"
          >
            <ChevronUpIcon className="h-4 w-4 text-ink-700" />
          </button>
        </div>

        <p className="text-sm text-ink-400 mt-2">Approximate location shown for privacy</p>
      </div>

      {/* Fullscreen modal */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex-1 relative">
            <LeafletMap lat={lat} lng={lng} />

            <button
              onClick={() => setExpanded(false)}
              className="absolute top-4 left-4 p-2.5 bg-white/90 rounded-full shadow-lg border border-ink-200 hover:bg-white transition-colors z-[400]"
              aria-label="Close map"
            >
              <XMarkIcon className="h-5 w-5 text-ink-700" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-5 py-3.5 border-t border-ink-200 bg-white">
            <MapPinIcon className="h-4 w-4 text-ink-400 flex-shrink-0" />
            <span className="text-sm font-medium text-ink-700 truncate">
              {title || 'Property Location'} — approximate location
            </span>
          </div>
        </div>
      )}
    </>
  );
}
