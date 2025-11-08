import { describe, it, expect } from 'vitest'
import { validateZoningResult } from './validate'

describe('validateZoningResult', () => {
  const validResult = {
    apn: '0204050712',
    jurisdiction: 'Austin, TX',
    zone: 'SF-3',
    setbacks_ft: {
      front: 25,
      side: 5,
      rear: 10,
      street_side: 0,
    },
    height_ft: 35,
    far: 0.4,
    lot_coverage_pct: 40,
    overlays: [],
    sources: [{ type: 'map', cite: 'austin_zoning_v2024' }],
    notes: '',
    run_ms: 150,
  }

  it('should validate correct schema', () => {
    expect(validateZoningResult(validResult)).toBe(true)
  })

  it('should reject invalid types', () => {
    expect(validateZoningResult(null)).toBe(false)
    expect(validateZoningResult(undefined)).toBe(false)
    expect(validateZoningResult('string')).toBe(false)
  })

  it('should reject missing required fields', () => {
    const { apn, ...withoutApn } = validResult
    expect(validateZoningResult(withoutApn)).toBe(false)
  })

  it('should reject invalid setbacks', () => {
    expect(validateZoningResult({
      ...validResult,
      setbacks_ft: { front: '25' } as any,
    })).toBe(false)
  })

  it('should reject invalid overlays', () => {
    expect(validateZoningResult({
      ...validResult,
      overlays: [123] as any,
    })).toBe(false)
  })
})

