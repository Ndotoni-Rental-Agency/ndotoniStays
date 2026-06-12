'use client';

import LocationSelector from '@/components/location/LocationSelector';
import LocationMapPicker from '@/components/location/LocationMapPicker';
import { StepProps } from './types';

export function StepLocation({ form, setForm }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Where is your property?</h2>
        <p className="text-sm sm:text-base text-ink-500 mb-6">Help guests find you by adding your location</p>
        <div className="max-w-xl">
          <LocationSelector
            value={{
              region: form.region,
              district: form.district,
              ward: form.ward,
              street: form.street,
            }}
            onChange={(loc) =>
              setForm((prev) => ({
                ...prev,
                region: loc.region,
                district: loc.district,
                ward: loc.ward || '',
                street: loc.street || '',
              }))
            }
            required
          />
        </div>
      </div>

      {form.region && form.district && (
        <div className="border-t border-ink-100 pt-8">
          <h3 className="text-base sm:text-lg font-semibold text-ink-900 mb-1">Pin exact location</h3>
          <p className="text-sm text-ink-500 mb-4">Optional — makes your listing more discoverable on the map</p>
          <LocationMapPicker
            location={{
              region: form.region,
              district: form.district,
              ward: form.ward,
              street: form.street,
            }}
            onChange={(coords) =>
              setForm((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))
            }
          />
        </div>
      )}
    </div>
  );
}
