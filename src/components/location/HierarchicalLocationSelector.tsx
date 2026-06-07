'use client';

/**
 * Hierarchical Location Selector Component
 * 
 * Provides a cascading dropdown interface for selecting locations:
 * Region → District → Ward → Street
 * 
 * Only loads data when needed, providing much better performance
 * than loading all 40,000+ locations upfront.
 */

import { useHierarchicalLocation } from '@/hooks/useHierarchicalLocation';

interface HierarchicalLocationSelectorProps {
  onLocationChange?: (location: {
    regionId?: string;
    regionName?: string;
    districtId?: string;
    districtName?: string;
    wardId?: string;
    wardName?: string;
    streetId?: string;
    streetName?: string;
  }) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function HierarchicalLocationSelector({
  onLocationChange,
  required = false,
  disabled = false,
  className = '',
}: HierarchicalLocationSelectorProps) {
  const {
    regions,
    districts,
    wards,
    streets,
    selected,
    selectRegion,
    selectDistrict,
    selectWard,
    selectStreet,
    loadingRegions,
    loadingDistricts,
    loadingWards,
    loadingStreets,
    error,
  } = useHierarchicalLocation();

  // Notify parent of location changes
  const handleLocationChange = () => {
    if (onLocationChange) {
      onLocationChange({
        regionId: selected.region?.id,
        regionName: selected.region?.name,
        districtId: selected.district?.id,
        districtName: selected.district?.name,
        wardId: selected.ward?.id,
        wardName: selected.ward?.name,
        streetId: selected.street?.id,
        streetName: selected.street?.name,
      });
    }
  };

  // Handle region selection
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    if (!regionId) {
      selectRegion(null);
    } else {
      const region = regions.find(r => r.id === regionId);
      if (region) {
        selectRegion(region);
      }
    }
    handleLocationChange();
  };

  // Handle district selection
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    if (!districtId) {
      selectDistrict(null);
    } else {
      const district = districts.find(d => d.id === districtId);
      if (district) {
        selectDistrict(district);
      }
    }
    handleLocationChange();
  };

  // Handle ward selection
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value;
    if (!wardId) {
      selectWard(null);
    } else {
      const ward = wards.find(w => w.id === wardId);
      if (ward) {
        selectWard(ward);
      }
    }
    handleLocationChange();
  };

  // Handle street selection
  const handleStreetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const streetId = e.target.value;
    if (!streetId) {
      selectStreet(null);
    } else {
      const street = streets.find(s => s.id === streetId);
      if (street) {
        selectStreet(street);
      }
    }
    handleLocationChange();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Region Selector */}
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
          Region {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="region"
          value={selected.region?.id || ''}
          onChange={handleRegionChange}
          disabled={disabled || loadingRegions}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingRegions ? 'Loading regions...' : 'Select a region'}
          </option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Selector */}
      {selected.region && (
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <select
            id="district"
            value={selected.district?.id || ''}
            onChange={handleDistrictChange}
            disabled={disabled || loadingDistricts || districts.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingDistricts
                ? 'Loading districts...'
                : districts.length === 0
                ? 'No districts available'
                : 'Select a district (optional)'}
            </option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ward Selector */}
      {selected.district && (
        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
            Ward
          </label>
          <select
            id="ward"
            value={selected.ward?.id || ''}
            onChange={handleWardChange}
            disabled={disabled || loadingWards || wards.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingWards
                ? 'Loading wards...'
                : wards.length === 0
                ? 'No wards available'
                : 'Select a ward (optional)'}
            </option>
            {wards.map(ward => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Street Selector */}
      {selected.ward && (
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <select
            id="street"
            value={selected.street?.id || ''}
            onChange={handleStreetChange}
            disabled={disabled || loadingStreets || streets.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingStreets
                ? 'Loading streets...'
                : streets.length === 0
                ? 'No streets available'
                : 'Select a street (optional)'}
            </option>
            {streets.map(street => (
              <option key={street.id} value={street.id}>
                {street.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Location Summary */}
      {selected.region && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-1">Selected Location:</p>
          <p className="text-sm text-gray-600">
            {[
              selected.street?.name,
              selected.ward?.name,
              selected.district?.name,
              selected.region?.name,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
