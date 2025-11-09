/**
 * Jurisdiction Resolver
 * 
 * Resolves jurisdiction and district from APN or lat/lng coordinates.
 */

import type { JurisdictionRegistry } from './registry'

export interface JurisdictionResult {
  jurisdiction_id: string
  district: string
  resolver: 'apn' | 'latlng' | 'stub'
}

/**
 * Resolve jurisdiction from APN
 * 
 * In CI/stub mode, uses a mapping table. In production, would query parcel data.
 */
export async function resolveFromAPN(apn: string): Promise<JurisdictionResult | null> {
  // Stub mode: use known APN mappings
  const stubMappings: Record<string, JurisdictionResult> = {
    '0204050712': { jurisdiction_id: 'austin', district: 'SF-3', resolver: 'stub' },
    '0204050713': { jurisdiction_id: 'austin', district: 'SF-2', resolver: 'stub' },
    '0204050714': { jurisdiction_id: 'austin', district: 'SF-1', resolver: 'stub' },
    // ETJ parcels
    'ETJ001': { jurisdiction_id: 'travis_etj', district: 'SF-3', resolver: 'stub' },
    'ETJ002': { jurisdiction_id: 'travis_etj', district: 'SF-2', resolver: 'stub' },
    'ETJ003': { jurisdiction_id: 'travis_etj', district: 'SF-1', resolver: 'stub' },
  }

  if (stubMappings[apn]) {
    return stubMappings[apn]
  }

  // Default: assume Austin for known APN format
  if (apn.startsWith('02')) {
    return { jurisdiction_id: 'austin', district: 'SF-3', resolver: 'apn' }
  }

  // ETJ APNs (stub)
  if (apn.startsWith('ETJ')) {
    return { jurisdiction_id: 'travis_etj', district: 'SF-3', resolver: 'apn' }
  }

  return null
}

/**
 * Resolve jurisdiction from lat/lng coordinates
 * 
 * In CI/stub mode, uses a bounding box. In production, would perform spatial query.
 */
export async function resolveFromLatLng(
  latitude: number,
  longitude: number
): Promise<JurisdictionResult | null> {
  // Stub mode: use bounding boxes
  // Austin: approximate bounds
  const austinBounds = {
    minLat: 30.0,
    maxLat: 30.5,
    minLng: -98.0,
    maxLng: -97.5,
  }

  // Travis ETJ: approximate bounds (outside Austin city limits)
  const etjBounds = {
    minLat: 30.1,
    maxLat: 30.4,
    minLng: -97.9,
    maxLng: -97.6,
  }

  // Check ETJ first (smaller area)
  if (
    latitude >= etjBounds.minLat &&
    latitude <= etjBounds.maxLat &&
    longitude >= etjBounds.minLng &&
    longitude <= etjBounds.maxLng
  ) {
    return { jurisdiction_id: 'travis_etj', district: 'SF-3', resolver: 'latlng' }
  }

  // Check Austin
  if (
    latitude >= austinBounds.minLat &&
    latitude <= austinBounds.maxLat &&
    longitude >= austinBounds.minLng &&
    longitude <= austinBounds.maxLng
  ) {
    return { jurisdiction_id: 'austin', district: 'SF-3', resolver: 'latlng' }
  }

  return null
}

/**
 * Load jurisdiction registry
 */
export async function loadRegistry(): Promise<JurisdictionRegistry> {
  try {
    const response = await fetch('/engine/juris/registry.json')
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.warn('Failed to load jurisdiction registry:', error)
  }
  return []
}

/**
 * Get jurisdiction by ID
 */
export async function getJurisdictionById(id: string): Promise<JurisdictionRegistry[0] | null> {
  const registry = await loadRegistry()
  return registry.find(j => j.id === id) || null
}

