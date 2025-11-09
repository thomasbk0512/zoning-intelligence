/**
 * Report Data Snapshot
 * 
 * Generates stable JSON snapshot of current results for export/print.
 */

import type { ZoningResult } from '../types'
import type { AnswersResponse } from './answers'
import type { CitationWithVersion } from '../engine/answers/citations'
import { loadSnapshot } from '../engine/citations/snapshot'

export interface ReportSnapshot {
  generated_at: string
  parcel: {
    apn?: string
    latitude?: number
    longitude?: number
    jurisdiction: string
    zone: string
  }
  answers: Array<{
    intent: string
    status: string
    value?: number
    unit?: string
    rationale?: string
    citations: CitationWithVersion[]
    provenance?: string
    badges?: string[]
  }>
  metadata: {
    jurisdiction_version?: string
    jurisdiction_published_at?: string
    has_conflicts: boolean
    has_overlays: boolean
    has_exceptions: boolean
    has_overrides: boolean
  }
}

/**
 * Generate report snapshot from current results
 */
export async function generateReportSnapshot(
  result: ZoningResult,
  answers: AnswersResponse | null
): Promise<ReportSnapshot> {
  const snapshot: ReportSnapshot = {
    generated_at: new Date().toISOString(),
    parcel: {
      apn: result.apn,
      latitude: result.latitude,
      longitude: result.longitude,
      jurisdiction: result.jurisdiction,
      zone: result.zone,
    },
    answers: [],
    metadata: {
      has_conflicts: false,
      has_overlays: false,
      has_exceptions: false,
      has_overrides: false,
    },
  }
  
  if (answers) {
    // Extract jurisdiction ID from result
    const jurisdictionId = result.jurisdiction.toLowerCase().includes('travis') ? 'travis_etj' : 'austin'
    
    // Load manifest for version info
    const citationSnapshot = await loadSnapshot(jurisdictionId)
    if (citationSnapshot) {
      snapshot.metadata.jurisdiction_version = citationSnapshot.manifest.version
      snapshot.metadata.jurisdiction_published_at = citationSnapshot.manifest.published_at
    }
    
    // Process answers
    snapshot.answers = answers.answers.map(answer => {
      const badges: string[] = []
      
      if (answer.provenance === 'override') {
        badges.push('Overridden')
        snapshot.metadata.has_overrides = true
      }
      if (answer.provenance === 'overlay') {
        badges.push('Overlay')
        snapshot.metadata.has_overlays = true
      }
      if (answer.provenance === 'exception') {
        badges.push('Exception')
        snapshot.metadata.has_exceptions = true
      }
      if (answer.status === 'needs_review') {
        snapshot.metadata.has_conflicts = true
      }
      
      return {
        intent: answer.intent,
        status: answer.status,
        value: answer.value,
        unit: answer.unit,
        rationale: answer.rationale,
        citations: answer.citations as CitationWithVersion[],
        provenance: answer.provenance,
        badges: badges.length > 0 ? badges : undefined,
      }
    })
  }
  
  return snapshot
}

