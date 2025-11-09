/**
 * React Hook for Telemetry
 * 
 * Provides convenient hooks for tracking telemetry events in React components.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { track, setRoute } from '../telemetry'

/**
 * Track page views on route changes
 */
export function usePageViewTracking() {
  const location = useLocation()

  useEffect(() => {
    const route = location.pathname
    setRoute(route)

    // Determine referrer type
    const referrer = document.referrer
    let referrerType: 'internal' | 'external' | 'direct' = 'direct'
    
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer)
        const currentUrl = new URL(window.location.href)
        referrerType = referrerUrl.origin === currentUrl.origin ? 'internal' : 'external'
      } catch {
        referrerType = 'external'
      }
    }

    track({
      event_type: 'page_view',
      referrer_type: referrerType,
    })
  }, [location.pathname])
}

/**
 * Track search submission
 */
export function trackSearchSubmit(mode: 'apn' | 'latlng', query: string, valid: boolean) {
  track({
    event_type: 'search_submit',
    mode,
    query_len: query.length,
    valid,
  })
}

/**
 * Track validation error
 */
export function trackValidationError(field: 'apn' | 'lat' | 'lng', reason: 'format' | 'range' | 'required') {
  track({
    event_type: 'validation_error',
    field,
    reason,
  })
}

/**
 * Track results render
 */
export function trackResultsRender(resultCount: number, fetchMs: number, renderMs: number, schemaFields: number) {
  track({
    event_type: 'results_render',
    result_count: resultCount,
    fetch_ms: fetchMs,
    render_ms: renderMs,
    schema_fields: schemaFields,
  })
}

/**
 * Track error shown
 */
export function trackErrorShown(surface: 'results' | 'search', code: string) {
  track({
    event_type: 'error_shown',
    surface,
    code,
  })
}

