/**
 * Unit tests for Answers Rules Engine
 */

import { describe, it, expect } from 'vitest'
import { getAnswersForZone, getAnswerForIntent } from '../../src/engine/answers/rules'
import type { ZoningIntent } from '../../src/engine/answers/rules'

describe('Answers Rules Engine', () => {
  describe('SF-3 zone', () => {
    const zone = 'SF-3'

    it('should return all 6 intents', () => {
      const answers = getAnswersForZone(zone)
      expect(answers).toHaveLength(6)
    })

    it('should return answered status for all intents', () => {
      const answers = getAnswersForZone(zone)
      answers.forEach(answer => {
        expect(answer.status).toBe('answered')
        expect(answer.value).toBeDefined()
        expect(answer.unit).toBeDefined()
        expect(answer.citations.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('should return correct front_setback', () => {
      const answer = getAnswerForIntent(zone, 'front_setback')
      expect(answer.status).toBe('answered')
      expect(answer.value).toBe(25)
      expect(answer.unit).toBe('ft')
      expect(answer.citations[0].section).toBe('25-2-492')
    })

    it('should return correct side_setback', () => {
      const answer = getAnswerForIntent(zone, 'side_setback')
      expect(answer.status).toBe('answered')
      expect(answer.value).toBe(5)
      expect(answer.unit).toBe('ft')
    })

    it('should return correct rear_setback', () => {
      const answer = getAnswerForIntent(zone, 'rear_setback')
      expect(answer.status).toBe('answered')
      expect(answer.value).toBe(10)
      expect(answer.unit).toBe('ft')
    })

    it('should return correct max_height', () => {
      const answer = getAnswerForIntent(zone, 'max_height')
      expect(answer.status).toBe('answered')
      expect(answer.value).toBe(35)
      expect(answer.unit).toBe('ft')
    })

    it('should return correct lot_coverage', () => {
      const answer = getAnswerForIntent(zone, 'lot_coverage')
      expect(answer.status).toBe('answered')
      expect(answer.value).toBe(40)
      expect(answer.unit).toBe('percent')
    })

    it('should return correct min_lot_size', () => {
      const answer = getAnswerForIntent(zone, 'min_lot_size')
      expect(answer.status).toBe('answered')
      expect(answer.value).toBe(5750)
      expect(answer.unit).toBe('sqft')
    })
  })

  describe('SF-2 zone', () => {
    const zone = 'SF-2'

    it('should return all 6 intents with answered status', () => {
      const answers = getAnswersForZone(zone)
      expect(answers).toHaveLength(6)
      answers.forEach(answer => {
        expect(answer.status).toBe('answered')
        expect(answer.citations.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('SF-1 zone', () => {
    const zone = 'SF-1'

    it('should return all 6 intents with answered status', () => {
      const answers = getAnswersForZone(zone)
      expect(answers).toHaveLength(6)
      answers.forEach(answer => {
        expect(answer.status).toBe('answered')
        expect(answer.citations.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('should return correct front_setback (40ft for SF-1)', () => {
      const answer = getAnswerForIntent(zone, 'front_setback')
      expect(answer.value).toBe(40)
    })
  })

  describe('Unknown zone', () => {
    it('should return needs_review status', () => {
      const answer = getAnswerForIntent('UNKNOWN', 'front_setback')
      expect(answer.status).toBe('needs_review')
      expect(answer.citations.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Citation requirements', () => {
    const intents: ZoningIntent[] = [
      'front_setback',
      'side_setback',
      'rear_setback',
      'max_height',
      'lot_coverage',
      'min_lot_size',
    ]

    intents.forEach(intent => {
      it(`should have at least one citation for ${intent}`, () => {
        const answer = getAnswerForIntent('SF-3', intent)
        expect(answer.citations.length).toBeGreaterThanOrEqual(1)
        expect(answer.citations[0].code_id).toBeDefined()
        expect(answer.citations[0].section).toBeDefined()
      })
    })
  })
})

