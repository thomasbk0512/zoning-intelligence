import axios, { AxiosError } from 'axios'
import { ZoningResult, SearchParams } from '../types'
import { validateZoningResult } from './validate'
import { getCacheKey, getCachedResult, setCachedResult } from './cache'

// Stub mode for E2E tests (deterministic, no live network)
const E2E_STUB = import.meta.env.VITE_E2E_STUB === '1' || import.meta.env.E2E_STUB === '1'
const BASE_URL = E2E_STUB 
  ? 'http://localhost:4173' // Stub endpoint (handled by Playwright route interception)
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s to match backend
  headers: {
    'Content-Type': 'application/json',
  },
})

// Connection status tracking
let connectionStatus = 'unknown' // 'online' | 'offline' | 'unknown'
let lastHealthCheck = 0
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

/**
 * Check backend health
 */
export async function checkBackendHealth() {
  try {
    const response = await api.get('/health', { timeout: 5000 })
    connectionStatus = 'online'
    lastHealthCheck = Date.now()
    return true
  } catch (error) {
    connectionStatus = 'offline'
    lastHealthCheck = Date.now()
    return false
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus() {
  return connectionStatus
}

// Defer API initialization to avoid blocking initial render
if (typeof window !== 'undefined') {
  // Check online/offline status
  const updateOnlineStatus = () => {
    connectionStatus = navigator.onLine ? 'online' : 'offline'
  }
  
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateOnlineStatus()

  // Warm up API connection
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      checkBackendHealth().catch(() => {})
    })
  } else {
    setTimeout(() => {
      checkBackendHealth().catch(() => {})
    }, 1000)
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError = false
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Get zoning by APN
 */
export async function getZoningByAPN(
  apn: string,
  city: string = 'austin'
): Promise<ZoningResult> {
  // Check cache first
  const cacheKey = getCacheKey(apn, undefined, undefined, city)
  const cached = getCachedResult(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const fetchStart = performance.now()
    const response = await api.get<ZoningResult>('/zoning', {
      params: { apn, city },
    })
    const fetchMs = Math.round(performance.now() - fetchStart)
    
    if (!validateZoningResult(response.data)) {
      throw new APIError('Invalid response schema from API')
    }
    
    // Cache the result
    setCachedResult(cacheKey, response.data)
    
    // Store fetch timing for telemetry
    ;(response.data as any).__fetch_ms = fetchMs
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      
      if (axiosError.code === 'ECONNABORTED') {
        throw new APIError('Request timeout. Please try again.', undefined, true)
      }
      
      if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
        // Provide more specific error message
        const isLocalhost = BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')
        const message = isLocalhost
          ? 'Cannot connect to backend server. Make sure the backend is running on ' + BASE_URL
          : 'Network error. Please check your connection and try again.'
        throw new APIError(message, undefined, true)
      }
      
      const status = axiosError.response.status
      const message = axiosError.response.data?.error || axiosError.message
      
      if (status >= 500) {
        throw new APIError(`Server error (${status}). Please try again later.`, status)
      }
      
      if (status === 404) {
        throw new APIError('Property not found. Please check the APN.', status)
      }
      
      throw new APIError(message || `Request failed (${status})`, status)
    }
    
    if (error instanceof APIError) {
      throw error
    }
    
    throw new APIError('An unexpected error occurred')
  }
}

/**
 * Get zoning by latitude/longitude
 */
export async function getZoningByLatLng(
  latitude: number,
  longitude: number,
  city: string = 'austin'
): Promise<ZoningResult> {
  // Check cache first
  const cacheKey = getCacheKey(undefined, latitude, longitude, city)
  const cached = getCachedResult(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const fetchStart = performance.now()
    const response = await api.get<ZoningResult>('/zoning', {
      params: { latitude, longitude, city },
    })
    const fetchMs = Math.round(performance.now() - fetchStart)
    
    if (!validateZoningResult(response.data)) {
      throw new APIError('Invalid response schema from API')
    }
    
    // Cache the result
    setCachedResult(cacheKey, response.data)
    
    // Store fetch timing for telemetry
    ;(response.data as any).__fetch_ms = fetchMs
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      
      if (axiosError.code === 'ECONNABORTED') {
        throw new APIError('Request timeout. Please try again.', undefined, true)
      }
      
      if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
        // Provide more specific error message
        const isLocalhost = BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')
        const message = isLocalhost
          ? 'Cannot connect to backend server. Make sure the backend is running on ' + BASE_URL
          : 'Network error. Please check your connection and try again.'
        throw new APIError(message, undefined, true)
      }
      
      const status = axiosError.response.status
      const message = axiosError.response.data?.error || axiosError.message
      
      if (status >= 500) {
        throw new APIError(`Server error (${status}). Please try again later.`, status)
      }
      
      if (status === 404) {
        throw new APIError('Property not found at this location.', status)
      }
      
      throw new APIError(message || `Request failed (${status})`, status)
    }
    
    if (error instanceof APIError) {
      throw error
    }
    
    throw new APIError('An unexpected error occurred')
  }
}

export default api

