/**
 * Unit tests for Report Snapshot
 */

import { describe, it, expect } from 'vitest'
import { generateReportSnapshot } from '../../src/lib/report'
import { validateSnapshot } from '../../src/engine/report/snapshot'
import type { ZoningResult } from '../../src/types'
import type { AnswersResponse } from '../../src/lib/answers'

describe('Report Snapshot', () => {
  it('should generate valid snapshot', async () => {
    const result: ZoningResult = {
      apn: '0204050712',
      jurisdiction: 'Austin',
      zone: 'SF-3',
      height_ft: 35,
      far: 0.4,
      lot_coverage_pct: 40,
      setbacks_ft: {
        front: 25,
        side: 5,
        rear: 10,
        street_side: 0,
      },
      overlays: [],
      sources: [],
      notes: '',
    }

    const answers: AnswersResponse = {
      answers: [
        {
          intent: 'front_setback',
          status: 'answered',
          value: 25,
          unit: 'ft',
          rationale: 'Minimum front yard setback',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-492',
              anchor: '(B)(1)',
              snippet: 'Front yard: 25 feet minimum',
              version: '2025.01',
              published_at: '2025-01-15',
            },
          ],
          answer_id: 'SF-3:front_setback',
          provenance: 'rule',
        },
      ],
      fetched_at: new Date().toISOString(),
      zone: 'SF-3',
    }

    const snapshot = await generateReportSnapshot(result, answers)
    
    expect(snapshot.generated_at).toBeDefined()
    expect(snapshot.parcel.apn).toBe('0204050712')
    expect(snapshot.parcel.zone).toBe('SF-3')
    expect(snapshot.answers.length).toBe(1)
    expect(snapshot.answers[0].citations[0].version).toBe('2025.01')
  })

  it('should validate snapshot structure', () => {
    const snapshot = {
      generated_at: new Date().toISOString(),
      parcel: {
        jurisdiction: 'Austin',
        zone: 'SF-3',
      },
      answers: [],
      metadata: {
        has_conflicts: false,
        has_overlays: false,
        has_exceptions: false,
        has_overrides: false,
      },
    }

    const validation = validateSnapshot(snapshot as any)
    expect(validation.valid).toBe(true)
    expect(validation.errors.length).toBe(0)
  })

  it('should detect invalid snapshot', () => {
    const snapshot = {
      generated_at: new Date().toISOString(),
      // Missing parcel
      answers: [],
    }

    const validation = validateSnapshot(snapshot as any)
    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })
})

