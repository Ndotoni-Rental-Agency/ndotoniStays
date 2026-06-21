'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppFAB() {
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  // Only show on the home page
  if (pathname !== '/') {
    return null;
  }

  return (
    <div
      className="flex"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        alignItems: 'center',
      }}
    >
      {/* Button */}
      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
        {/* Ping ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: '#1DBF53',
            animation: 'wa-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
        {/* The button itself */}
        <a
          href="https://wa.me/255790720329?text=Habari%2C%20nahitaji%20msaada%20wa%20booking"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Tuma meseji WhatsApp"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1DBF53',
            boxShadow: '0 6px 24px rgba(29,191,83,0.4)',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" fill="white">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.83 1.782 6.86L2 30l7.347-1.757A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 0 1-5.89-1.607l-.422-.25-4.36 1.043 1.072-4.24-.276-.435A11.56 11.56 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.34-8.64c-.347-.174-2.055-1.013-2.374-1.129-.319-.116-.551-.174-.783.174-.232.347-.9 1.129-1.103 1.362-.203.232-.406.26-.753.087-.347-.174-1.464-.54-2.788-1.72-1.03-.918-1.726-2.052-1.929-2.399-.203-.347-.022-.535.153-.708.157-.156.347-.406.52-.61.174-.203.232-.347.347-.579.116-.232.058-.435-.029-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
        </a>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes wa-ping {
          0%   { transform: scale(1);   opacity: 0.3; }
          70%  { transform: scale(1.6); opacity: 0;   }
          100% { transform: scale(1.6); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}
