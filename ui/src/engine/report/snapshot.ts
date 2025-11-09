/**
 * Report Snapshot Engine
 * 
 * Generates stable, versioned snapshots of parcel reports.
 */

import type { ReportSnapshot } from '../../lib/report'

/**
 * Serialize report snapshot to JSON
 */
export function serializeSnapshot(snapshot: ReportSnapshot): string {
  return JSON.stringify(snapshot, null, 2)
}

/**
 * Validate report snapshot structure
 */
export function validateSnapshot(snapshot: ReportSnapshot): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!snapshot.generated_at) {
    errors.push('Missing generated_at')
  }
  
  if (!snapshot.parcel) {
    errors.push('Missing parcel')
  } else {
    if (!snapshot.parcel.jurisdiction) {
      errors.push('Missing parcel.jurisdiction')
    }
    if (!snapshot.parcel.zone) {
      errors.push('Missing parcel.zone')
    }
  }
  
  if (!Array.isArray(snapshot.answers)) {
    errors.push('Missing or invalid answers array')
  }
  
  if (!snapshot.metadata) {
    errors.push('Missing metadata')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

