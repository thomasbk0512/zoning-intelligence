import { ZoningResult } from '../types'

interface CacheEntry {
  key: string
  data: ZoningResult
  timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CacheEntry>()

/**
 * Generate cache key from search parameters
 */
export function getCacheKey(
  apn?: string,
  latitude?: number,
  longitude?: number,
  city?: string
): string {
  if (apn) {
    return `apn:${apn}:${city || 'austin'}`
  }
  if (latitude !== undefined && longitude !== undefined) {
    return `latlng:${latitude}:${longitude}:${city || 'austin'}`
  }
  return ''
}

/**
 * Get cached result if available and not expired
 */
export function getCachedResult(key: string): ZoningResult | null {
  const entry = cache.get(key)
  if (!entry) {
    return null
  }

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Cache a result
 */
export function setCachedResult(key: string, data: ZoningResult): void {
  cache.set(key, {
    key,
    data,
    timestamp: Date.now(),
  })
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Clear expired entries
 */
export function clearExpired(): void {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}

