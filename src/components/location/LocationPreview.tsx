'use client';

interface LocationPreviewProps {
  region: string;
  district: string;
  ward?: string;
  street?: string;
  className?: string;
}

export default function LocationPreview({ 
  region, 
  district, 
  ward, 
  street, 
  className = '' 
}: LocationPreviewProps) {
  const locationParts = [street, ward, district, region].filter(Boolean);
  
  if (locationParts.length === 0) {
    return null;
  }

  return (
    <div className={`bg-brand-50 border border-brand-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-brand-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-brand-900 mb-1">Selected Location</h4>
          <p className="text-sm text-brand-700">
            {locationParts.join(', ')}
          </p>
          
          {/* Breakdown */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-brand-600">
            {region && (
              <div>
                <span className="font-medium">Region:</span> {region}
              </div>
            )}
            {district && (
              <div>
                <span className="font-medium">District:</span> {district}
              </div>
            )}
            {ward && (
              <div>
                <span className="font-medium">Ward:</span> {ward}
              </div>
            )}
            {street && (
              <div>
                <span className="font-medium">Street:</span> {street}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
