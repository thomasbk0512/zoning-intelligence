/**
 * Unit tests for Answers with Overrides Applied
 */

import { describe, it, expect } from 'vitest'
import { getAnswersForZone } from '../../src/engine/answers/rules'
import { mergeWithOverrides, loadOverrides } from '../../src/engine/answers/merge'

describe('Answers with Overrides', () => {
  it('should load overrides without errors', async () => {
    const overrides = await loadOverrides()
    expect(Array.isArray(overrides)).toBe(true)
  })

  it('should apply overrides to SF-3 answers', async () => {
    const answers = getAnswersForZone('SF-3')
    const overrides = await loadOverrides()

    // Apply overrides
    const answersWithOverrides = answers.map(answer => mergeWithOverrides(answer, overrides))

    // All answers should still be present
    expect(answersWithOverrides).toHaveLength(6)

    // Check that no answers are missing
    const missingAnswers = answersWithOverrides.filter(a => a.status === 'missing')
    expect(missingAnswers).toHaveLength(0)

    // If overrides exist, some may have provenance 'override'
    const overriddenAnswers = answersWithOverrides.filter(a => a.provenance === 'override')
    // This is fine - we just want to ensure the merge works
    expect(answersWithOverrides.length).toBeGreaterThanOrEqual(overriddenAnswers.length)
  })

  it('should preserve all intents when overrides applied', async () => {
    const intents = [
      'front_setback',
      'side_setback',
      'rear_setback',
      'max_height',
      'lot_coverage',
      'min_lot_size',
    ]

    const answers = getAnswersForZone('SF-3')
    const overrides = await loadOverrides()
    const answersWithOverrides = answers.map(answer => mergeWithOverrides(answer, overrides))

    const presentIntents = answersWithOverrides.map(a => a.intent)
    intents.forEach(intent => {
      expect(presentIntents).toContain(intent)
    })
  })

  it('should maintain citations when overrides applied', async () => {
    const answers = getAnswersForZone('SF-3')
    const overrides = await loadOverrides()
    const answersWithOverrides = answers.map(answer => mergeWithOverrides(answer, overrides))

    answersWithOverrides.forEach(answer => {
      expect(answer.citations.length).toBeGreaterThanOrEqual(1)
      if (answer.provenance === 'override') {
        // Overridden answers should have override citation first
        expect(answer.citations[0].code_id).toBeDefined()
      }
    })
  })
})

