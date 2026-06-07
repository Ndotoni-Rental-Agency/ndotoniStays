'use client';

import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';


// ✅ FIX: tell Leaflet where to load marker images from
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom pin (normal pin shape, custom color based on theme)
const createCustomPin = (isDark: boolean) => {
  const pinColor = isDark ? '#065f46' : '#1f2937'; // emerald-800 for dark, gray-800 for light
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="${pinColor}"/>
        <circle cx="12.5" cy="12.5" r="4" fill="white"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });
};

interface Props {
  lat: number;
  lng: number;
  radius?: number;
}

export default function LocationMapView({ 
  lat, 
  lng, 
  radius = 600
}: Props) {
  const theme: string = 'light';
  const isDark = theme === 'dark';
  const [pin, setPin] = useState<L.Icon | null>(null);
  
  // Generate consistent offset for privacy (like Airbnb)
  const getApproximateLocation = () => {
    const seed = Math.abs(Math.sin(lat * lng * 1000));
    const offsetRadius = 0.002; // ~200m
    const angle = seed * 2 * Math.PI;
    const distance = seed * offsetRadius;
    
    return [
      lat + (distance * Math.cos(angle)),
      lng + (distance * Math.sin(angle))
    ] as [number, number];
  };

  const [pinPosition] = useState(getApproximateLocation());

  useEffect(() => {
    setPin(createCustomPin(isDark));
  }, [isDark]);

  if (!pin) return null;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative z-0">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        
        {/* Simple circle - like Airbnb */}
        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{ 
            color: isDark ? '#065f46' : '#1f2937', // emerald-800 for dark, gray-800 for light
            weight: 2, 
            fillColor: isDark ? '#065f46' : '#1f2937', 
            fillOpacity: 0.1
          }}
        />
        
        {/* Normal pin shape with custom color */}
        <Marker position={pinPosition} icon={pin} />
      </MapContainer>
    </div>
  );
}