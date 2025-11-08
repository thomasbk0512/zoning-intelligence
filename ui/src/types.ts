/**
 * Frozen output schema matching backend CLI
 */
export interface ZoningResult {
  apn: string
  jurisdiction: string
  zone: string
  setbacks_ft: {
    front: number
    side: number
    rear: number
    street_side: number
  }
  height_ft: number
  far: number
  lot_coverage_pct: number
  overlays: string[]
  sources: Array<{
    type: string
    cite: string
  }>
  notes: string
  run_ms: number
  parcel_geometry?: GeoJSON.Geometry
  zoning_geometry?: GeoJSON.Geometry
}

export interface SearchParams {
  apn?: string
  latitude?: number
  longitude?: number
  city: string
}

export type SearchType = 'apn' | 'location'

