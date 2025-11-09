/**
 * Unit tests for Citation Manifests
 */

import { describe, it, expect } from 'vitest'
import { loadManifest, loadSnapshot } from '../../src/engine/citations/snapshot'

describe('Citation Manifests', () => {
  it('should load Austin manifest', async () => {
    const manifest = await loadManifest('austin')
    expect(manifest).not.toBeNull()
    expect(manifest?.jurisdiction_id).toBe('austin')
    expect(manifest?.version).toMatch(/^\d{4}\.\d{2}$/)
    expect(manifest?.sources.length).toBeGreaterThan(0)
  })

  it('should load Travis ETJ manifest', async () => {
    const manifest = await loadManifest('travis_etj')
    expect(manifest).not.toBeNull()
    expect(manifest?.jurisdiction_id).toBe('travis_etj')
    expect(manifest?.version).toMatch(/^\d{4}\.\d{2}$/)
  })

  it('should load complete snapshot', async () => {
    const snapshot = await loadSnapshot('austin')
    expect(snapshot).not.toBeNull()
    expect(snapshot?.manifest.jurisdiction_id).toBe('austin')
    expect(Object.keys(snapshot?.anchors || {}).length).toBeGreaterThan(0)
  })
})

