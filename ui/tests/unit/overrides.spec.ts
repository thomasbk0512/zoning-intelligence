/**
 * Unit tests for Overrides
 */

import { describe, it, expect } from 'vitest'
import { mergeWithOverrides } from '../../src/engine/answers/merge'
import type { ZoningAnswer } from '../../src/engine/answers/rules'
import type { Override } from '../../src/engine/answers/merge'

describe('Overrides Merge', () => {
  const baseAnswer: ZoningAnswer = {
    intent: 'front_setback',
    status: 'answered',
    value: 25,
    unit: 'ft',
    rationale: 'Minimum front yard setback for SF-3',
    citations: [
      {
        code_id: 'austin_ldc_2024',
        section: '25-2-492',
        anchor: '(B)(1)',
      },
    ],
    answer_id: 'SF-3:front_setback',
    provenance: 'rule',
  }

  it('should return original answer when no overrides match', () => {
    const overrides: Override[] = []
    const result = mergeWithOverrides(baseAnswer, overrides)
    expect(result).toEqual(baseAnswer)
    expect(result.provenance).toBe('rule')
  })

  it('should apply district-scoped override', () => {
    const overrides: Override[] = [
      {
        district: 'SF-3',
        intent: 'front_setback',
        value: 30,
        unit: 'ft',
        citation: {
          code_id: 'austin_ldc_2024',
          section: '25-2-492',
          anchor: '(B)(1)(a)',
        },
        rationale: 'Updated per code amendment',
      },
    ]
    const result = mergeWithOverrides(baseAnswer, overrides)
    expect(result.value).toBe(30)
    expect(result.provenance).toBe('override')
    expect(result.citations[0].section).toBe('25-2-492')
    expect(result.citations[0].anchor).toBe('(B)(1)(a)')
  })

  it('should prefer parcel-scoped override over district-scoped', () => {
    const districtOverride: Override = {
      district: 'SF-3',
      intent: 'front_setback',
      value: 30,
      unit: 'ft',
      citation: {
        code_id: 'austin_ldc_2024',
        section: '25-2-492',
        anchor: '(B)(1)(a)',
      },
      rationale: 'District override',
    }
    const parcelOverride: Override = {
      district: 'SF-3',
      intent: 'front_setback',
      value: 35,
      unit: 'ft',
      citation: {
        code_id: 'austin_ldc_2024',
        section: '25-2-492',
        anchor: '(B)(1)(b)',
      },
      rationale: 'Parcel-specific override',
      scope: 'parcel',
      apn: '0204050712',
    }
    const overrides = [districtOverride, parcelOverride]

    // With matching APN, parcel override should win
    const resultWithApn = mergeWithOverrides(baseAnswer, overrides, '0204050712')
    expect(resultWithApn.value).toBe(35)
    expect(resultWithApn.provenance).toBe('override')

    // Without matching APN, district override should win
    const resultWithoutApn = mergeWithOverrides(baseAnswer, overrides, 'OTHER_APN')
    expect(resultWithoutApn.value).toBe(30)
    expect(resultWithoutApn.provenance).toBe('override')
  })

  it('should ignore expired overrides', () => {
    const pastDate = new Date()
    pastDate.setFullYear(pastDate.getFullYear() - 1)
    const expiredOverride: Override = {
      district: 'SF-3',
      intent: 'front_setback',
      value: 30,
      unit: 'ft',
      citation: {
        code_id: 'austin_ldc_2024',
        section: '25-2-492',
        anchor: '(B)(1)(a)',
      },
      rationale: 'Expired override',
      expires: pastDate.toISOString().split('T')[0], // YYYY-MM-DD
    }
    const result = mergeWithOverrides(baseAnswer, [expiredOverride])
    expect(result.value).toBe(25) // Original value
    expect(result.provenance).toBe('rule')
  })

  it('should not apply override for different district', () => {
    const override: Override = {
      district: 'SF-2',
      intent: 'front_setback',
      value: 30,
      unit: 'ft',
      citation: {
        code_id: 'austin_ldc_2024',
        section: '25-2-491',
        anchor: '(B)(1)',
      },
      rationale: 'SF-2 override',
    }
    const result = mergeWithOverrides(baseAnswer, [override])
    expect(result.value).toBe(25) // Original value
    expect(result.provenance).toBe('rule')
  })

  it('should not apply override for different intent', () => {
    const override: Override = {
      district: 'SF-3',
      intent: 'side_setback',
      value: 10,
      unit: 'ft',
      citation: {
        code_id: 'austin_ldc_2024',
        section: '25-2-492',
        anchor: '(B)(2)',
      },
      rationale: 'Side setback override',
    }
    const result = mergeWithOverrides(baseAnswer, [override])
    expect(result.value).toBe(25) // Original value
    expect(result.provenance).toBe('rule')
  })
})

