/**
 * Unit tests for Conflict Resolution
 */

import { describe, it, expect } from 'vitest'
import { resolveConflicts, formatConflictMessage, type ConflictSource } from '../../src/engine/answers/conflicts'

describe('Conflict Resolution', () => {
  it('should return missing answer when no sources', () => {
    const resolution = resolveConflicts([])
    expect(resolution.answer.status).toBe('missing')
    expect(resolution.hasConflict).toBe(false)
  })

  it('should return single source without conflict', () => {
    const sources: ConflictSource[] = [
      {
        type: 'rule',
        value: 25,
        unit: 'ft',
        citations: [
          {
            code_id: 'austin_ldc_2024',
            section: '25-2-492',
            anchor: '(B)(1)',
          },
        ],
      },
    ]
    const resolution = resolveConflicts(sources)
    expect(resolution.answer.value).toBe(25)
    expect(resolution.hasConflict).toBe(false)
  })

  it('should prefer override over rule', () => {
    const sources: ConflictSource[] = [
      {
        type: 'rule',
        value: 25,
        unit: 'ft',
        citations: [],
      },
      {
        type: 'override',
        value: 30,
        unit: 'ft',
        citations: [],
      },
    ]
    const resolution = resolveConflicts(sources)
    expect(resolution.answer.value).toBe(30)
    expect(resolution.answer.provenance).toBe('override')
    expect(resolution.hasConflict).toBe(false)
  })

  it('should detect conflict when values differ', () => {
    const sources: ConflictSource[] = [
      {
        type: 'overlay',
        id: 'HD',
        value: 30,
        unit: 'ft',
        citations: [],
      },
      {
        type: 'exception',
        id: 'corner_lot',
        value: 20,
        unit: 'ft',
        citations: [],
      },
    ]
    const resolution = resolveConflicts(sources)
    expect(resolution.hasConflict).toBe(true)
    expect(resolution.answer.status).toBe('needs_review')
    expect(resolution.conflictSources).toHaveLength(2)
  })

  it('should not conflict when values match', () => {
    const sources: ConflictSource[] = [
      {
        type: 'overlay',
        id: 'HD',
        value: 30,
        unit: 'ft',
        citations: [],
      },
      {
        type: 'exception',
        id: 'corner_lot',
        value: 30,
        unit: 'ft',
        citations: [],
      },
    ]
    const resolution = resolveConflicts(sources)
    expect(resolution.hasConflict).toBe(false)
    expect(resolution.answer.status).toBe('answered')
  })

  it('should format conflict message', () => {
    const sources: ConflictSource[] = [
      {
        type: 'overlay',
        id: 'HD',
        value: 30,
        unit: 'ft',
        citations: [],
      },
      {
        type: 'exception',
        id: 'corner_lot',
        value: 20,
        unit: 'ft',
        citations: [],
      },
    ]
    const message = formatConflictMessage(sources)
    expect(message).toContain('Overlay (HD)')
    expect(message).toContain('Exception (corner_lot)')
    expect(message).toContain('30 ft')
    expect(message).toContain('20 ft')
  })
})
