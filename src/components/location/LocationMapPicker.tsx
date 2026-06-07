'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LocationMapClient = dynamic(
  () => import('./LocationMap.client'),
  { ssr: false } // 🚨 THIS FIXES THE ERROR
);

interface Props {
  location: {
    region: string;
    district: string;
    ward?: string;
    street?: string;
  };
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationMapPicker({ location, onChange }: Props) {
  const [position, setPosition] = useState<[number, number]>([
    -6.7924,
    39.2083,
  ]);
  const [loading, setLoading] = useState(false);

  const query = [
    location.street,
    location.ward,
    location.district,
    location.region,
    'Tanzania',
  ]
    .filter(Boolean)
    .join(', ');

  useEffect(() => {
    if (!location.region || !location.district) return;

    setLoading(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setPosition([lat, lng]);
          onChange({ lat, lng });
        }
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        {loading ? 'Locating area…' : 'Drag the pin to exact property location'}
      </p>

      <div className="h-[320px] rounded-lg overflow-hidden border">
        <LocationMapClient
          position={position}
          onMove={(lat, lng) => {
            setPosition([lat, lng]);
            onChange({ lat, lng });
          }}
        />
      </div>

      <p className="text-xs text-gray-500">
        Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
      </p>
    </div>
  );
}
