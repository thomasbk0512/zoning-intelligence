/**
 * Unit tests for Jurisdiction Resolver
 */

import { describe, it, expect } from 'vitest'
import { resolveFromAPN, resolveFromLatLng, getJurisdictionById } from '../../src/engine/juris/resolve'

describe('Jurisdiction Resolver', () => {
  describe('resolveFromAPN', () => {
    it('should resolve Austin jurisdiction for known APN', async () => {
      const result = await resolveFromAPN('0204050712')
      expect(result).not.toBeNull()
      expect(result?.jurisdiction_id).toBe('austin')
      expect(result?.district).toBe('SF-3')
    })

    it('should resolve ETJ jurisdiction for ETJ APN', async () => {
      const result = await resolveFromAPN('ETJ001')
      expect(result).not.toBeNull()
      expect(result?.jurisdiction_id).toBe('travis_etj')
      expect(result?.district).toBe('SF-3')
    })

    it('should return null for unknown APN', async () => {
      const result = await resolveFromAPN('UNKNOWN123')
      expect(result).toBeNull()
    })
  })

  describe('resolveFromLatLng', () => {
    it('should resolve Austin jurisdiction for Austin coordinates', async () => {
      const result = await resolveFromLatLng(30.25, -97.75)
      expect(result).not.toBeNull()
      expect(result?.jurisdiction_id).toBe('austin')
      expect(result?.resolver).toBe('latlng')
    })

    it('should resolve ETJ jurisdiction for ETJ coordinates', async () => {
      const result = await resolveFromLatLng(30.2, -97.75)
      expect(result).not.toBeNull()
      expect(result?.jurisdiction_id).toBe('travis_etj')
      expect(result?.resolver).toBe('latlng')
    })

    it('should return null for coordinates outside known bounds', async () => {
      const result = await resolveFromLatLng(40.0, -100.0)
      expect(result).toBeNull()
    })
  })

  describe('getJurisdictionById', () => {
    it('should return Austin jurisdiction', async () => {
      const juris = await getJurisdictionById('austin')
      expect(juris).not.toBeNull()
      expect(juris?.id).toBe('austin')
      expect(juris?.name).toBe('Austin')
      expect(juris?.code_ids).toContain('austin_ldc_2024')
    })

    it('should return ETJ jurisdiction', async () => {
      const juris = await getJurisdictionById('travis_etj')
      expect(juris).not.toBeNull()
      expect(juris?.id).toBe('travis_etj')
      expect(juris?.name).toBe('Travis County ETJ')
      expect(juris?.code_ids).toContain('travis_etj_ord_2024')
    })

    it('should return null for unknown jurisdiction', async () => {
      const juris = await getJurisdictionById('unknown')
      expect(juris).toBeNull()
    })
  })
})

