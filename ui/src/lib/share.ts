/**
 * Share & Permalink Utilities
 * 
 * Builds stable, privacy-safe permalinks for parcel reports.
 */

export interface ShareParams {
  type: 'apn' | 'latlng'
  apn?: string
  latitude?: number
  longitude?: number
  city: string
  zone?: string
  jurisdictionId?: string
}

/**
 * Generate a report token from query parameters
 * Token is a short hash for deduplication and validation
 */
function generateReportToken(params: ShareParams): string {
  const parts = [
    params.type,
    params.apn || `${params.latitude},${params.longitude}`,
    params.city,
    params.zone || '',
    params.jurisdictionId || '',
  ]
  const input = parts.join('|')
  
  // Simple hash function (for deterministic CI)
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Return positive hex string (8 chars)
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Build a shareable permalink
 * Privacy-safe: no raw coordinates if APN is present
 */
export function buildPermalink(params: ShareParams): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://example.com'
  
  const token = generateReportToken(params)
  const searchParams = new URLSearchParams()
  
  // Always include type and city
  searchParams.set('type', params.type)
  searchParams.set('city', params.city)
  searchParams.set('token', token)
  
  // Include APN if present (preferred)
  if (params.apn) {
    searchParams.set('apn', params.apn)
    // Never include coordinates when APN is present (privacy)
  } else if (params.latitude !== undefined && params.longitude !== undefined) {
    // Only include coordinates if no APN
    searchParams.set('lat', params.latitude.toString())
    searchParams.set('lng', params.longitude.toString())
  }
  
  // Include zone and jurisdiction if available
  if (params.zone) {
    searchParams.set('zone', params.zone)
  }
  if (params.jurisdictionId) {
    searchParams.set('jurisdiction', params.jurisdictionId)
  }
  
  return `${baseUrl}/results?${searchParams.toString()}`
}

/**
 * Parse permalink parameters
 */
export function parsePermalink(searchParams: URLSearchParams): ShareParams | null {
  const type = searchParams.get('type')
  if (type !== 'apn' && type !== 'latlng') {
    return null
  }
  
  const city = searchParams.get('city')
  if (!city) {
    return null
  }
  
  const params: ShareParams = {
    type,
    city,
  }
  
  // Parse APN or coordinates
  if (type === 'apn') {
    const apn = searchParams.get('apn')
    if (!apn) {
      return null
    }
    params.apn = apn
  } else {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    if (!lat || !lng) {
      return null
    }
    params.latitude = parseFloat(lat)
    params.longitude = parseFloat(lng)
  }
  
  // Optional parameters
  const zone = searchParams.get('zone')
  if (zone) {
    params.zone = zone
  }
  
  const jurisdictionId = searchParams.get('jurisdiction')
  if (jurisdictionId) {
    params.jurisdictionId = jurisdictionId
  }
  
  return params
}

/**
 * Sanitize URL by removing tracking parameters
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove common tracking params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid']
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }
  
  // Fallback for older browsers
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  } catch {
    return false
  }
}

