/**
 * Unit tests for Overlays
 */

import { describe, it, expect } from 'vitest'
import { applyOverlayAdjustments, loadOverlayAdjustments } from '../../src/engine/answers/overlays'
import type { ZoningAnswer } from '../../src/engine/answers/rules'

describe('Overlay Adjustments', () => {
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

  it('should return original answer when no overlays match', () => {
    const overlays = []
    const context = { overlays: ['HD'] }
    const result = applyOverlayAdjustments(baseAnswer, overlays, context)
    expect(result.answer.value).toBe(25)
    expect(result.appliedOverlays).toHaveLength(0)
  })

  it('should apply min constraint overlay', () => {
    const overlays = [
      {
        id: 'HD',
        name: 'Historic District',
        applies_to: ['front_setback'],
        op: 'min' as const,
        value: 30,
        unit: 'ft',
        citations: [
          {
            code_id: 'austin_ldc_2024',
            section: '25-2-900',
            anchor: '(B)(1)',
          },
        ],
      },
    ]
    const context = { overlays: ['HD'] }
    const result = applyOverlayAdjustments(baseAnswer, overlays, context)
    expect(result.answer.value).toBe(25) // min(25, 30) = 25, but overlay min means at least 30
    // Actually, min operation means the value must be at least the adjustment value
    // So min(25, 30) should return 30
    expect(result.answer.value).toBe(30)
    expect(result.appliedOverlays).toContain('HD')
    expect(result.answer.provenance).toBe('overlay')
  })

  it('should apply max constraint overlay', () => {
    const overlays = [
      {
        id: 'NP',
        name: 'Neighborhood Plan',
        applies_to: ['lot_coverage'],
        op: 'max' as const,
        value: 35,
        unit: 'percent',
        citations: [
          {
            code_id: 'austin_ldc_2024',
            section: '25-2-800',
            anchor: '(C)',
          },
        ],
      },
    ]
    const answer: ZoningAnswer = {
      ...baseAnswer,
      intent: 'lot_coverage',
      value: 40,
      unit: 'percent',
    }
    const context = { overlays: ['NP'] }
    const result = applyOverlayAdjustments(answer, overlays, context)
    expect(result.answer.value).toBe(35) // max(40, 35) = 35
    expect(result.appliedOverlays).toContain('NP')
  })

  it('should apply replace operation', () => {
    const overlays = [
      {
        id: 'HD',
        name: 'Historic District',
        applies_to: ['front_setback'],
        op: 'replace' as const,
        value: 30,
        unit: 'ft',
        citations: [
          {
            code_id: 'austin_ldc_2024',
            section: '25-2-900',
            anchor: '(B)(1)',
          },
        ],
      },
    ]
    const context = { overlays: ['HD'] }
    const result = applyOverlayAdjustments(baseAnswer, overlays, context)
    expect(result.answer.value).toBe(30)
    expect(result.appliedOverlays).toContain('HD')
  })

  it('should apply add operation', () => {
    const overlays = [
      {
        id: 'FLAG',
        name: 'Flag Lot Overlay',
        applies_to: ['front_setback'],
        op: 'add' as const,
        value: 5,
        unit: 'ft',
        citations: [
          {
            code_id: 'austin_ldc_2024',
            section: '25-2-492',
            anchor: '(B)(5)',
          },
        ],
      },
    ]
    const context = { overlays: ['FLAG'] }
    const result = applyOverlayAdjustments(baseAnswer, overlays, context)
    expect(result.answer.value).toBe(30) // 25 + 5
    expect(result.appliedOverlays).toContain('FLAG')
  })

  it('should load overlay adjustments without errors', async () => {
    const overlays = await loadOverlayAdjustments()
    expect(Array.isArray(overlays)).toBe(true)
  })
})
