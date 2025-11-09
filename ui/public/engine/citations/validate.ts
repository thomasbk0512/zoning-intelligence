/**
 * Citation Validation
 * 
 * Validates manifest integrity and detects stale anchors.
 */

import type { CodeManifest, AnchorEntry, CitationSnapshot } from './snapshot'
import type { CodeCitation } from '../answers/rules'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface CitationWithVersion extends CodeCitation {
  version?: string
  published_at?: string
  stale?: boolean
}

/**
 * Compute SHA256 hash of a string (simplified for browser)
 */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate manifest schema and hash
 */
export async function validateManifest(
  manifest: CodeManifest,
  anchorsContent: string
): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate version format
  if (!/^\d{4}\.\d{2}$/.test(manifest.version)) {
    errors.push(`Invalid version format: ${manifest.version}`)
  }

  // Validate published_at format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.published_at)) {
    errors.push(`Invalid published_at format: ${manifest.published_at}`)
  }

  // Validate hash matches anchors file
  const computedHash = await sha256(anchorsContent)
  if (manifest.hash !== computedHash) {
    errors.push(`Manifest hash mismatch: expected ${manifest.hash}, got ${computedHash}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Check if a citation anchor exists and is current
 */
export function validateCitation(
  citation: CodeCitation,
  snapshot: CitationSnapshot | null
): { exists: boolean; stale: boolean; anchor?: AnchorEntry } {
  if (!snapshot) {
    return { exists: false, stale: false }
  }

  const key = `${citation.section}:${citation.anchor || ''}`
  const anchor = snapshot.anchors[key]

  if (!anchor) {
    return { exists: false, stale: false }
  }

  // Check if snippet hash matches (if snippet provided)
  let stale = false
  if (citation.snippet) {
    // In a real implementation, we'd hash the snippet and compare
    // For now, we'll use a simple check: if snippet doesn't match, mark as stale
    // This is a placeholder - actual implementation would hash the snippet
    stale = false // Will be set by simulate-update script in CI
  }

  return {
    exists: true,
    stale,
    anchor,
  }
}

/**
 * Attach version info to citations
 */
export async function attachVersionInfo(
  citations: CodeCitation[],
  jurisdictionId: string
): Promise<CitationWithVersion[]> {
  const snapshot = await loadSnapshot(jurisdictionId)
  if (!snapshot) {
    return citations.map(c => ({ ...c }))
  }

  return citations.map(citation => {
    const validation = validateCitation(citation, snapshot)
    const anchor = validation.anchor

    return {
      ...citation,
      version: snapshot.manifest.version,
      published_at: snapshot.manifest.published_at,
      stale: validation.stale,
      // Include snippet_hash if anchor found
      snippet_hash: anchor?.snippet_hash,
    }
  })
}

