/**
 * Merge Rules and Overrides
 * 
 * Applies overrides to rules-based answers with precedence:
 * 1. Parcel-scoped overrides (highest priority)
 * 2. District-scoped overrides
 * 3. Rules (default)
 */

import type { ZoningAnswer } from './rules'
import type { CodeCitation } from './rules'

export interface Override {
  district: string
  intent: string
  value: number
  unit: string
  citation: CodeCitation
  rationale: string
  expires?: string // ISO date string
  scope?: 'district' | 'parcel'
  apn?: string
}

/**
 * Merge rules-based answer with overrides
 * 
 * @param answer - Answer from rules engine
 * @param overrides - Array of overrides to apply
 * @param apn - Optional APN for parcel-scoped override matching
 * @returns Merged answer with override applied if applicable
 */
export function mergeWithOverrides(
  answer: ZoningAnswer,
  overrides: Override[],
  apn?: string
): ZoningAnswer {
  if (!answer.answer_id) {
    return answer
  }

  const [district, intent] = answer.answer_id.split(':')
  if (!district || !intent) {
    return answer
  }

  // Filter applicable overrides (not expired)
  const now = new Date()
  const applicableOverrides = overrides.filter(override => {
    // Check expiration
    if (override.expires) {
      const expiresDate = new Date(override.expires)
      if (expiresDate < now) {
        return false // Expired
      }
    }

    // Match district and intent
    if (override.district !== district || override.intent !== intent) {
      return false
    }

    // For parcel-scoped, must match APN
    if (override.scope === 'parcel') {
      return override.apn === apn
    }

    return true
  })

  if (applicableOverrides.length === 0) {
    return answer
  }

  // Precedence: parcel > district
  const parcelOverride = applicableOverrides.find(o => o.scope === 'parcel')
  const districtOverride = applicableOverrides.find(o => o.scope === 'district' || !o.scope)

  const selectedOverride = parcelOverride || districtOverride
  if (!selectedOverride) {
    return answer
  }

  // Apply override
  return {
    ...answer,
    value: selectedOverride.value,
    unit: selectedOverride.unit,
    rationale: selectedOverride.rationale,
    citations: [
      selectedOverride.citation, // Override citation first
      ...answer.citations, // Then original citations
    ],
    provenance: 'override',
  }
}

/**
 * Load overrides from JSON file
 */
export async function loadOverrides(): Promise<Override[]> {
  try {
    const response = await fetch('/engine/answers/overrides.json')
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.warn('Failed to load overrides:', error)
  }
  return []
}

