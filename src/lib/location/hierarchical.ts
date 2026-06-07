/**
 * Hierarchical Location Fetching
 * 
 * This module provides on-demand location fetching using GraphQL queries.
 * Instead of loading 40,000+ locations upfront, we fetch:
 * - Regions first (~30 items)
 * - Districts when a region is selected (~200 items)
 * - Wards when a district is selected (~1000 items)
 * - Streets when a ward is selected (~5000 items)
 * 
 * This dramatically improves initial load time and reduces memory usage.
 */

import { GraphQLClient } from '@/lib/graphql-client';
import { getRegions, getDistricts, getWards, getStreets } from '@/graphql/queries';
import * as APITypes from '@/API';

// Re-export types from generated API
export type Region = {
  id: string;
  name: string;
};

export type District = {
  id: string;
  name: string;
  regionId: string;
};

export type Ward = {
  id: string;
  name: string;
  districtId: string;
};

export type Street = {
  id: string;
  name: string;
  wardId: string;
};

// Cache for hierarchical data
interface HierarchicalCache {
  regions: Region[] | null;
  districts: Map<string, District[]>; // regionId -> districts
  wards: Map<string, Ward[]>; // districtId -> wards
  streets: Map<string, Street[]>; // wardId -> streets
  timestamp: number;
}

const cache: HierarchicalCache = {
  regions: null,
  districts: new Map(),
  wards: new Map(),
  streets: new Map(),
  timestamp: 0,
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Set regions from initial app state
 * This allows us to populate the cache without making a separate API call
 */
export function setRegionsFromCache(regions: Region[]): void {
  cache.regions = regions.sort((a, b) => a.name.localeCompare(b.name));
  cache.timestamp = Date.now();
}

/**
 * Fetch all regions (top level of hierarchy)
 * This is the only call needed on initial page load
 */
export async function fetchRegions(): Promise<Region[]> {
  const now = Date.now();
  
  if (cache.regions && (now - cache.timestamp) < CACHE_DURATION) {
    return cache.regions;
  }
  
  try {
    const result = await GraphQLClient.executePublic<APITypes.GetRegionsQuery>(getRegions);
    
    cache.regions = result.getRegions.sort((a, b) => a.name.localeCompare(b.name));
    cache.timestamp = now;
    
    return cache.regions;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    throw new Error('Failed to load regions. Please try again.');
  }
}

/**
 * Fetch districts for a specific region
 * Only called when user selects a region
 */
export async function fetchDistricts(regionId: string): Promise<District[]> {
  if (!regionId) {
    throw new Error('Region ID is required');
  }

  if (cache.districts.has(regionId)) {
    return cache.districts.get(regionId)!;
  }
  
  try {
    const result = await GraphQLClient.executePublic<APITypes.GetDistrictsQuery>(
      getDistricts,
      { regionId }
    );
    
    const districts = result.getDistricts.sort((a, b) => a.name.localeCompare(b.name));
    cache.districts.set(regionId, districts);
    
    return districts;
  } catch (error) {
    console.error(`Failed to fetch districts for region ${regionId}:`, error);
    throw new Error('Failed to load districts. Please try again.');
  }
}

/**
 * Fetch wards for a specific district
 * Only called when user selects a district
 */
export async function fetchWards(districtId: string): Promise<Ward[]> {
  if (!districtId) {
    throw new Error('District ID is required');
  }

  if (cache.wards.has(districtId)) {
    return cache.wards.get(districtId)!;
  }
  
  try {
    const result = await GraphQLClient.executePublic<APITypes.GetWardsQuery>(
      getWards,
      { districtId }
    );
    
    const wards = result.getWards.sort((a, b) => a.name.localeCompare(b.name));
    cache.wards.set(districtId, wards);
    
    return wards;
  } catch (error) {
    console.error(`Failed to fetch wards for district ${districtId}:`, error);
    throw new Error('Failed to load wards. Please try again.');
  }
}

/**
 * Fetch streets for a specific ward
 * Only called when user selects a ward
 */
export async function fetchStreets(wardId: string): Promise<Street[]> {
  if (!wardId) {
    throw new Error('Ward ID is required');
  }

  if (cache.streets.has(wardId)) {
    return cache.streets.get(wardId)!;
  }
  
  try {
    const result = await GraphQLClient.executePublic<APITypes.GetStreetsQuery>(
      getStreets,
      { wardId }
    );
    
    const streets = result.getStreets.sort((a, b) => a.name.localeCompare(b.name));
    cache.streets.set(wardId, streets);
    
    return streets;
  } catch (error) {
    console.error(`Failed to fetch streets for ward ${wardId}:`, error);
    throw new Error('Failed to load streets. Please try again.');
  }
}

/**
 * Clear all cached location data
 */
export function clearLocationCache(): void {
  cache.regions = null;
  cache.districts.clear();
  cache.wards.clear();
  cache.streets.clear();
  cache.timestamp = 0;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  const age = cache.timestamp ? now - cache.timestamp : 0;
  const isValid = age < CACHE_DURATION;
  
  return {
    hasRegions: !!cache.regions,
    regionsCount: cache.regions?.length ?? 0,
    cachedDistricts: cache.districts.size,
    cachedWards: cache.wards.size,
    cachedStreets: cache.streets.size,
    ageMs: age,
    ageMinutes: Math.round(age / 60000),
    isValid,
    expiresInMs: isValid ? CACHE_DURATION - age : 0,
  };
}
