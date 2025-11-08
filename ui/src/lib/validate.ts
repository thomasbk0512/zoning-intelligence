import { ZoningResult } from '../types'

/**
 * Validate zoning result matches frozen schema
 */
export function validateZoningResult(data: unknown): data is ZoningResult {
  if (!data || typeof data !== 'object') return false
  
  const result = data as Record<string, unknown>
  
  // Required fields
  if (typeof result.apn !== 'string') return false
  if (typeof result.jurisdiction !== 'string') return false
  if (typeof result.zone !== 'string') return false
  if (typeof result.height_ft !== 'number') return false
  if (typeof result.far !== 'number') return false
  if (typeof result.lot_coverage_pct !== 'number') return false
  if (typeof result.notes !== 'string') return false
  if (typeof result.run_ms !== 'number') return false
  
  // Setbacks
  if (!result.setbacks_ft || typeof result.setbacks_ft !== 'object') return false
  const setbacks = result.setbacks_ft as Record<string, unknown>
  if (typeof setbacks.front !== 'number') return false
  if (typeof setbacks.side !== 'number') return false
  if (typeof setbacks.rear !== 'number') return false
  if (typeof setbacks.street_side !== 'number') return false
  
  // Overlays
  if (!Array.isArray(result.overlays)) return false
  if (!result.overlays.every((o: unknown) => typeof o === 'string')) return false
  
  // Sources
  if (!Array.isArray(result.sources)) return false
  if (!result.sources.every((s: unknown) => {
    if (!s || typeof s !== 'object') return false
    const source = s as Record<string, unknown>
    return typeof source.type === 'string' && typeof source.cite === 'string'
  })) return false
  
  return true
}

