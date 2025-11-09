/**
 * Overlay Resolver
 * 
 * Applies overlay district adjustments to base district answers.
 */

import type { ZoningAnswer } from './rules'
import type { CodeCitation } from './rules'

export type AdjustmentOp = 'max' | 'min' | 'add' | 'replace'

export interface OverlayAdjustment {
  id: string
  name: string
  applies_to: string[]
  op: AdjustmentOp
  value: number
  unit: string
  citations: CodeCitation[]
}

export interface OverlayContext {
  overlays: string[] // Overlay IDs, e.g., ["HD", "NP"]
}

/**
 * Apply a single adjustment operation to a value
 */
function applyAdjustment(
  baseValue: number,
  op: AdjustmentOp,
  adjustmentValue: number
): number {
  switch (op) {
    case 'replace':
      return adjustmentValue
    case 'add':
      return baseValue + adjustmentValue
    case 'max':
      // max constraint: value must be at most adjustmentValue
      return Math.min(baseValue, adjustmentValue)
    case 'min':
      // min constraint: value must be at least adjustmentValue
      return Math.max(baseValue, adjustmentValue)
    default:
      return baseValue
  }
}

/**
 * Apply overlay adjustments to an answer
 */
export function applyOverlayAdjustments(
  answer: ZoningAnswer,
  overlays: OverlayAdjustment[],
  overlayContext: OverlayContext
): {
  answer: ZoningAnswer
  appliedOverlays: string[]
} {
  const applicableOverlays = overlays.filter(overlay =>
    overlayContext.overlays.includes(overlay.id) &&
    overlay.applies_to.includes(answer.intent)
  )

  if (applicableOverlays.length === 0) {
    return { answer, appliedOverlays: [] }
  }

  if (answer.value === undefined || answer.status !== 'answered') {
    return { answer, appliedOverlays: [] }
  }

  // Apply adjustments in order (replace operations take precedence)
  let adjustedValue = answer.value
  const appliedOverlayIds: string[] = []
  const allCitations: CodeCitation[] = [...answer.citations]

  // First, apply replace operations
  const replaceOverlays = applicableOverlays.filter(o => o.op === 'replace')
  if (replaceOverlays.length > 0) {
    const replaceOverlay = replaceOverlays[0] // Use first replace
    adjustedValue = applyAdjustment(adjustedValue, 'replace', replaceOverlay.value)
    appliedOverlayIds.push(replaceOverlay.id)
    allCitations.unshift(...replaceOverlay.citations) // Overlay citations first
  }

  // Then apply min/max constraints
  const constraintOverlays = applicableOverlays.filter(o => o.op === 'min' || o.op === 'max')
  for (const overlay of constraintOverlays) {
    const beforeValue = adjustedValue
    adjustedValue = applyAdjustment(adjustedValue, overlay.op, overlay.value)
    if (adjustedValue !== beforeValue) {
      appliedOverlayIds.push(overlay.id)
      allCitations.unshift(...overlay.citations)
    }
  }

  // Finally, apply add operations
  const addOverlays = applicableOverlays.filter(o => o.op === 'add')
  for (const overlay of addOverlays) {
    adjustedValue = applyAdjustment(adjustedValue, 'add', overlay.value)
    appliedOverlayIds.push(overlay.id)
    allCitations.unshift(...overlay.citations)
  }

  return {
    answer: {
      ...answer,
      value: adjustedValue,
      citations: allCitations,
      provenance: appliedOverlayIds.length > 0 ? 'overlay' : answer.provenance,
    },
    appliedOverlays: appliedOverlayIds,
  }
}

/**
 * Load overlay adjustments
 */
export async function loadOverlayAdjustments(): Promise<OverlayAdjustment[]> {
  try {
    const response = await fetch('/engine/answers/config/overlays.json')
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.warn('Failed to load overlay adjustments:', error)
  }
  return []
}
