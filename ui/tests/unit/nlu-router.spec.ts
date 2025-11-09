/**
 * Unit tests for NLU Router
 */

import { describe, it, expect } from 'vitest'
import { parseQuery } from '../../src/engine/nlu/router'
import examplesData from '../../src/engine/nlu/examples.json'

describe('NLU Router', () => {
  describe('parseQuery', () => {
    it('should parse front setback query with APN', () => {
      const result = parseQuery('how far from the street for APN 0204050712')
      
      expect(result.intent).toBe('front_setback')
      expect(result.mode).toBe('apn')
      expect(result.params.apn).toBe('0204050712')
      expect(result.confidence).toBeGreaterThanOrEqual(0.7)
    })

    it('should parse max height query with zone and APN', () => {
      const result = parseQuery('how tall can I build in SF-3 APN 0204050712')
      
      expect(result.intent).toBe('max_height')
      expect(result.mode).toBe('apn')
      expect(result.params.apn).toBe('0204050712')
      expect(result.params.zone).toBe('SF-3')
      expect(result.confidence).toBeGreaterThanOrEqual(0.7)
    })

    it('should parse lat/lng coordinates', () => {
      const result = parseQuery('front yard setback at 30.25, -97.75')
      
      expect(result.intent).toBe('front_setback')
      expect(result.mode).toBe('latlng')
      expect(result.params.latitude).toBe(30.25)
      expect(result.params.longitude).toBe(-97.75)
    })

    it('should handle queries without locator', () => {
      const result = parseQuery('front setback')
      
      expect(result.intent).toBe('front_setback')
      expect(result.mode).toBe('none')
      expect(result.needs_confirmation).toBe(false) // High confidence, just missing locator
    })

    it('should return null intent for unrecognized queries', () => {
      const result = parseQuery('what is the weather today')
      
      expect(result.intent).toBeNull()
      expect(result.confidence).toBe(0)
      expect(result.needs_confirmation).toBe(true)
    })
  })

  describe('examples.json coverage', () => {
    examplesData.examples.forEach((example, index) => {
      it(`should match example ${index + 1}: "${example.query.substring(0, 50)}..."`, () => {
        const result = parseQuery(example.query)
        const expected = example.expected

        if (expected.intent) {
          expect(result.intent).toBe(expected.intent)
        }

        expect(result.mode).toBe(expected.mode)

        if (expected.params.apn) {
          expect(result.params.apn).toBe(expected.params.apn)
        }

        if (expected.params.latitude !== undefined) {
          expect(result.params.latitude).toBeCloseTo(expected.params.latitude, 2)
        }

        if (expected.params.longitude !== undefined) {
          expect(result.params.longitude).toBeCloseTo(expected.params.longitude, 2)
        }

        if (expected.params.zone) {
          expect(result.params.zone).toBe(expected.zone)
        }

        if (expected.confidence) {
          const threshold = parseFloat(expected.confidence.replace('>=', ''))
          expect(result.confidence).toBeGreaterThanOrEqual(threshold)
        }
      })
    })
  })
})

