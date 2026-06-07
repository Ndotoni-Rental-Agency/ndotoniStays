'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHierarchicalLocation } from '@/hooks/useHierarchicalLocation';
import LocationPreview from './LocationPreview';
import { toTitleCase } from '@/lib/utils';

interface LocationSelectorProps {
  value: {
    region: string;
    district: string;
    ward?: string;
    street?: string;
  };
  onChange: (location: {
    region: string;
    district: string;
    ward?: string;
    street?: string;
  }) => void;
  required?: boolean;
  className?: string;
  errors?: { region?: string; district?: string; ward?: string };
}

export default function LocationSelector({
  value,
  onChange,
  required = false,
  className = '',
  errors = {},
}: LocationSelectorProps) {
  const [showCustomStreet, setShowCustomStreet] = useState(false);

  const {
    regions,
    districts,
    wards,
    streets,
    selected,
    selectRegion,
    selectDistrict,
    selectWard,
    loadingRegions,
    loadingStreets,
    error,
  } = useHierarchicalLocation();

  // Sync form value with selected location
  useEffect(() => {
    if (value.region && !selected.region) {
      const region = regions.find((r) => r.name === value.region);
      if (region) selectRegion(region);
    }
  }, [value.region, regions, selected.region]);

  useEffect(() => {
    if (value.district && selected.region && !selected.district) {
      const district = districts.find((d) => d.name === value.district);
      if (district) selectDistrict(district);
    }
  }, [value.district, districts, selected.district, selected.region]);

  useEffect(() => {
    if (value.ward && selected.district && !selected.ward) {
      const ward = wards.find((w) => w.name === value.ward);
      if (ward) selectWard(ward);
    }
  }, [value.ward, wards, selected.ward, selected.district]);

  // Show custom street input if no streets available
  useEffect(() => {
    if (selected.ward && streets.length === 0 && !loadingStreets) {
      setShowCustomStreet(true);
    } else if (streets.length > 0) {
      setShowCustomStreet(false);
    }
  }, [selected.ward, streets.length, loadingStreets]);

  const handleRegionChange = useCallback(
    (regionName: string) => {
      const region = regions.find((r) => r.name === regionName);
      selectRegion(region || null);
      onChange({ region: regionName, district: '', ward: '', street: '' });
    },
    [onChange, regions, selectRegion]
  );

  const handleDistrictChange = useCallback(
    (districtName: string) => {
      const district = districts.find((d) => d.name === districtName);
      selectDistrict(district || null);
      onChange({ ...value, district: districtName, ward: '', street: '' });
    },
    [onChange, value, districts, selectDistrict]
  );

  const handleWardChange = useCallback(
    (wardName: string) => {
      const ward = wards.find((w) => w.name === wardName);
      selectWard(ward || null);
      onChange({ ...value, ward: wardName, street: '' });
      setShowCustomStreet(false);
    },
    [onChange, value, wards, selectWard]
  );

  const handleStreetChange = useCallback(
    (street: string) => {
      onChange({ ...value, street });
    },
    [onChange, value]
  );

  const handleStreetDropdownChange = useCallback(
    (street: string) => {
      if (street === 'custom') {
        setShowCustomStreet(true);
        onChange({ ...value, street: '' });
      } else {
        setShowCustomStreet(false);
        onChange({ ...value, street });
      }
    },
    [onChange, value]
  );

  if (loadingRegions) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="p-4 bg-gray-50 dark:bg-emerald-900/20 border border-gray-200 dark:border-emerald-800 rounded-lg text-gray-900 dark:text-emerald-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Region {required && '*'}
          </label>
          <select
            value={value.region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
              errors.region ? 'border-gray-900 dark:border-emerald-500 focus:ring-gray-900 dark:focus:ring-emerald-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.name}>
                {toTitleCase(region.name)}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="text-sm text-gray-900 dark:text-emerald-400 mt-1">{errors.region}</p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            District {required && '*'}
          </label>
          <select
            value={value.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!value.region || districts.length === 0}
            className={`w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
              errors.district ? 'border-gray-900 dark:border-emerald-500 focus:ring-gray-900 dark:focus:ring-emerald-500' : 'border-gray-300 dark:border-gray-600'
            } ${!value.region ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.id} value={district.name}>
                {toTitleCase(district.name)}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-sm text-gray-900 dark:text-emerald-400 mt-1">{errors.district}</p>
          )}
        </div>
      </div>

      {/* Ward and Street */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ward */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ward 
          </label>
          <select
            value={value.ward || ''}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!value.district || wards.length === 0}
            className={`w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
              errors.ward ? 'border-gray-900 dark:border-emerald-500 focus:ring-gray-900 dark:focus:ring-emerald-500' : 'border-gray-300 dark:border-gray-600'
            } ${!value.district ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Select Ward</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.name}>
                {toTitleCase(ward.name)}
              </option>
            ))}
          </select>
          {errors.ward && (
            <p className="text-sm text-gray-900 dark:text-emerald-400 mt-1">{errors.ward}</p>
          )}
        </div>

        {/* Street */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Street Address
          </label>
          {value.ward && streets.length > 0 && !showCustomStreet ? (
            <select
              value={value.street || ''}
              onChange={(e) => handleStreetDropdownChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <option value="">Select Street</option>
              {streets.map((street) => (
                <option key={street.id} value={street.name}>
                  {toTitleCase(street.name)}
                </option>
              ))}
              <option value="custom">Other (Enter custom street)</option>
            </select>
          ) : (
            <input
              type="text"
              value={value.street || ''}
              onChange={(e) => handleStreetChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              placeholder="e.g., Haile Selassie Road"
            />
          )}
        </div>
      </div>

      {/* Location Preview */}
      {value.region && value.district && (
        <LocationPreview
          region={value.region}
          district={value.district}
          ward={value.ward}
          street={value.street}
        />
      )}
    </div>
  );
}
