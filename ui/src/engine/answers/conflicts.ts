/**
 * Conflict Resolution
 * 
 * Deterministic conflict resolution when multiple rules produce incompatible values.
 */

import type { ZoningAnswer } from './rules'
import type { CodeCitation } from './rules'

export interface ConflictSource {
  type: 'rule' | 'overlay' | 'exception' | 'override'
  id?: string
  value: number
  unit: string
  citations: CodeCitation[]
}

export interface ConflictResolution {
  answer: ZoningAnswer
  hasConflict: boolean
  conflictSources?: ConflictSource[]
  conflictMessage?: string
}

/**
 * Resolve conflicts between multiple sources
 * 
 * Precedence: parcel override > parcel exception > overlay replace > overlay min/max/add > district rule
 */
export function resolveConflicts(
  sources: ConflictSource[]
): ConflictResolution {
  if (sources.length === 0) {
    return {
      answer: {
        intent: 'front_setback' as any,
        status: 'missing',
        citations: [],
      },
      hasConflict: false,
    }
  }

  if (sources.length === 1) {
    const source = sources[0]
    return {
      answer: {
        intent: 'front_setback' as any, // Will be set by caller
        status: 'answered',
        value: source.value,
        unit: source.unit,
        citations: source.citations,
        provenance: source.type,
      },
      hasConflict: false,
    }
  }

  // Sort by precedence
  const precedence: Record<string, number> = {
    override: 5,
    exception: 4,
    overlay: 3,
    rule: 1,
  }

  const sorted = sources.sort((a, b) => {
    const aPrec = precedence[a.type] || 0
    const bPrec = precedence[b.type] || 0
    return bPrec - aPrec
  })

  // Check for incompatible values
  const topSource = sorted[0]
  const conflicting = sorted.filter(
    s => s.value !== topSource.value && s.unit === topSource.unit
  )

  if (conflicting.length > 0) {
    // Conflict detected - escalate to needs_review
    const conflictMessage = `Conflicting values: ${sorted
      .map(s => `${s.type}${s.id ? ` (${s.id})` : ''}: ${s.value} ${s.unit}`)
      .join(', ')}`

    return {
      answer: {
        intent: 'front_setback' as any, // Will be set by caller
        status: 'needs_review',
        citations: sorted.flatMap(s => s.citations),
        provenance: topSource.type,
      },
      hasConflict: true,
      conflictSources: sorted,
      conflictMessage,
    }
  }

  // No conflict - use highest precedence source
  return {
    answer: {
      intent: 'front_setback' as any, // Will be set by caller
      status: 'answered',
      value: topSource.value,
      unit: topSource.unit,
      citations: topSource.citations,
      provenance: topSource.type,
    },
    hasConflict: false,
  }
}

/**
 * Format conflict message for UI
 */
export function formatConflictMessage(conflictSources: ConflictSource[]): string {
  if (conflictSources.length === 0) return ''

  const parts = conflictSources.map(source => {
    const typeLabel =
      source.type === 'override'
        ? 'Override'
        : source.type === 'overlay'
        ? `Overlay${source.id ? ` (${source.id})` : ''}`
        : source.type === 'exception'
        ? `Exception${source.id ? ` (${source.id})` : ''}`
        : 'Rule'
    return `${typeLabel}: ${source.value} ${source.unit}`
  })

  return `Conflicting values from: ${parts.join(', ')}`
}
