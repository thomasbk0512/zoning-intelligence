/**
 * Unit tests for Share Link Utilities
 */

import { describe, it, expect } from 'vitest'
import { buildPermalink, parsePermalink, sanitizeUrl, generateReportToken } from '../../src/lib/share'
import type { ShareParams } from '../../src/lib/share'

describe('Share Link Utilities', () => {
  describe('buildPermalink', () => {
    it('should build APN permalink', () => {
      const params: ShareParams = {
        type: 'apn',
        apn: '0204050712',
        city: 'austin',
        zone: 'SF-3',
        jurisdictionId: 'austin',
      }
      
      const link = buildPermalink(params)
      expect(link).toContain('type=apn')
      expect(link).toContain('apn=0204050712')
      expect(link).toContain('city=austin')
      expect(link).not.toContain('lat=')
      expect(link).not.toContain('lng=')
    })

    it('should build lat/lng permalink when no APN', () => {
      const params: ShareParams = {
        type: 'latlng',
        latitude: 30.25,
        longitude: -97.75,
        city: 'austin',
      }
      
      const link = buildPermalink(params)
      expect(link).toContain('type=latlng')
      expect(link).toContain('lat=30.25')
      expect(link).toContain('lng=-97.75')
    })

    it('should not include coordinates when APN is present', () => {
      const params: ShareParams = {
        type: 'apn',
        apn: '0204050712',
        latitude: 30.25,
        longitude: -97.75,
        city: 'austin',
      }
      
      const link = buildPermalink(params)
      expect(link).not.toContain('lat=')
      expect(link).not.toContain('lng=')
    })

    it('should include token', () => {
      const params: ShareParams = {
        type: 'apn',
        apn: '0204050712',
        city: 'austin',
      }
      
      const link = buildPermalink(params)
      expect(link).toContain('token=')
    })
  })

  describe('parsePermalink', () => {
    it('should parse APN permalink', () => {
      const searchParams = new URLSearchParams('type=apn&apn=0204050712&city=austin&zone=SF-3')
      const params = parsePermalink(searchParams)
      
      expect(params).not.toBeNull()
      expect(params?.type).toBe('apn')
      expect(params?.apn).toBe('0204050712')
      expect(params?.city).toBe('austin')
      expect(params?.zone).toBe('SF-3')
    })

    it('should parse lat/lng permalink', () => {
      const searchParams = new URLSearchParams('type=latlng&lat=30.25&lng=-97.75&city=austin')
      const params = parsePermalink(searchParams)
      
      expect(params).not.toBeNull()
      expect(params?.type).toBe('latlng')
      expect(params?.latitude).toBe(30.25)
      expect(params?.longitude).toBe(-97.75)
    })

    it('should return null for invalid permalink', () => {
      const searchParams = new URLSearchParams('type=invalid&city=austin')
      const params = parsePermalink(searchParams)
      
      expect(params).toBeNull()
    })
  })

  describe('sanitizeUrl', () => {
    it('should remove tracking parameters', () => {
      const url = 'https://example.com/results?type=apn&apn=123&utm_source=test&utm_medium=email&fbclid=abc'
      const sanitized = sanitizeUrl(url)
      
      expect(sanitized).not.toContain('utm_source')
      expect(sanitized).not.toContain('utm_medium')
      expect(sanitized).not.toContain('fbclid')
      expect(sanitized).toContain('type=apn')
    })
  })
})

