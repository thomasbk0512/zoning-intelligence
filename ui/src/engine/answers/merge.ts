/**
 * Merge Rules, Overlays, Exceptions, and Overrides
 * 
 * Applies adjustments with precedence:
 * 1. Parcel-scoped overrides (highest priority)
 * 2. Parcel exceptions
 * 3. Overlay replace operations
 * 4. Overlay min/max/add operations
 * 5. District rules (default)
 */

import type { ZoningAnswer } from './rules'
import type { CodeCitation } from './rules'
import { applyOverlayAdjustments, loadOverlayAdjustments, type OverlayAdjustment } from './overlays'
import { loadExceptionRules, evaluatePredicate, type ExceptionRule, type LotContext } from './conditions'
import { resolveConflicts, type ConflictSource } from './conflicts'
import {
  buildTrace,
  createRuleStep,
  createOverlayStep,
  createExceptionStep,
  createOverrideStep,
  type TraceStep,
  type AnswerTrace,
} from './trace'

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

export interface ParcelContext {
  overlays?: string[] // Overlay IDs
  lot?: LotContext // Lot conditions
}

/**
 * Merge rules-based answer with overlays, exceptions, and overrides
 * 
 * @param answer - Answer from rules engine
 * @param overrides - Array of overrides to apply
 * @param apn - Optional APN for parcel-scoped override matching
 * @param overlayContext - Optional overlay context (overlay IDs)
 * @param lotContext - Optional lot context (corner, flag, frontage, slope)
 * @param jurisdictionId - Jurisdiction ID for trace building
 * @returns Merged answer with all adjustments applied
 */
export async function mergeWithOverrides(
  answer: ZoningAnswer,
  overrides: Override[],
  apn?: string,
  overlayContext?: { overlays: string[] },
  lotContext?: LotContext,
  jurisdictionId?: string
): Promise<ZoningAnswer> {
  if (!answer.answer_id) {
    return answer
  }

  const [district, intent] = answer.answer_id.split(':')
  if (!district || !intent) {
    return answer
  }

  // Build trace steps
  const traceSteps: TraceStep[] = []
  let currentValue = answer.value

  // Collect all potential sources
  const sources: ConflictSource[] = []

  // 1. Base rule (always first step)
  if (answer.value !== undefined && answer.status === 'answered') {
    const ruleId = `rule.${district}.${intent}`
    const ruleExpr = `${answer.value}`
    traceSteps.push(
      createRuleStep(ruleId, answer.value, ruleExpr, answer.citations)
    )
    
    sources.push({
      type: 'rule',
      value: answer.value,
      unit: answer.unit || '',
      citations: answer.citations,
    })
  }

  // 2. Overlay adjustments
  if (overlayContext && overlayContext.overlays.length > 0) {
    const overlayAdjustments = await loadOverlayAdjustments()
    const { answer: overlayAnswer, appliedOverlays } = applyOverlayAdjustments(
      answer,
      overlayAdjustments,
      overlayContext
    )
    if (appliedOverlays.length > 0 && overlayAnswer.value !== undefined) {
      // Find the overlay adjustment that was applied
      for (const overlayId of appliedOverlays) {
        const overlay = overlayAdjustments.find(o => o.id === overlayId)
        if (overlay && currentValue !== undefined) {
          const prevValue = currentValue
          currentValue = overlayAnswer.value
          traceSteps.push(
            createOverlayStep(
              `overlay.${overlayId}`,
              overlay.op,
              prevValue,
              overlay.value,
              currentValue,
              overlay.citations
            )
          )
        }
      }
      
      sources.push({
        type: 'overlay',
        id: appliedOverlays[0],
        value: overlayAnswer.value,
        unit: overlayAnswer.unit || '',
        citations: overlayAnswer.citations.filter((c, i) =>
          overlayAnswer.citations.slice(0, i + 1).some(c2 => c2.section === c.section)
        ),
      })
    }
  }

  // 3. Exception adjustments
  if (lotContext) {
    const exceptionRules = await loadExceptionRules()
    for (const rule of exceptionRules) {
      if (evaluatePredicate(rule.predicate, lotContext)) {
        const adjustment = rule.adjustments.find(a => a.intent === intent)
        if (adjustment && currentValue !== undefined) {
          const prevValue = currentValue
          let exceptionValue = currentValue
          switch (adjustment.op) {
            case 'replace':
              exceptionValue = adjustment.value
              break
            case 'add':
              exceptionValue = currentValue + adjustment.value
              break
            case 'max':
              exceptionValue = Math.min(currentValue, adjustment.value)
              break
            case 'min':
              exceptionValue = Math.max(currentValue, adjustment.value)
              break
          }
          currentValue = exceptionValue
          traceSteps.push(
            createExceptionStep(
              `exception.${rule.id}`,
              adjustment.op,
              prevValue,
              adjustment.value,
              exceptionValue,
              rule.citations
            )
          )
          
          sources.push({
            type: 'exception',
            id: rule.id,
            value: exceptionValue,
            unit: adjustment.unit,
            citations: rule.citations,
          })
        }
      }
    }
  }

  // 4. Overrides (highest precedence)
  const now = new Date()
  const applicableOverrides = overrides.filter(override => {
    if (override.expires) {
      const expiresDate = new Date(override.expires)
      if (expiresDate < now) return false
    }
    if (override.district !== district || override.intent !== intent) return false
    if (override.scope === 'parcel') return override.apn === apn
    return true
  })

  if (applicableOverrides.length > 0) {
    const parcelOverride = applicableOverrides.find(o => o.scope === 'parcel')
    const districtOverride = applicableOverrides.find(o => o.scope === 'district' || !o.scope)
    const selectedOverride = parcelOverride || districtOverride
    if (selectedOverride) {
      const prevValue = currentValue
      currentValue = selectedOverride.value
      traceSteps.push(
        createOverrideStep(
          `override.${selectedOverride.scope || 'district'}`,
          selectedOverride.value,
          [selectedOverride.citation]
        )
      )
      
      sources.push({
        type: 'override',
        id: selectedOverride.scope,
        value: selectedOverride.value,
        unit: selectedOverride.unit,
        citations: [selectedOverride.citation],
      })
    }
  }

  // Resolve conflicts
  const resolution = resolveConflicts(sources)
  const resolvedAnswer = {
    ...resolution.answer,
    intent: answer.intent, // Preserve original intent
  }

  // Attach trace to answer if jurisdictionId provided
  if (jurisdictionId && traceSteps.length > 0) {
    try {
      const trace = buildTrace(resolvedAnswer, jurisdictionId, district, traceSteps)
      ;(resolvedAnswer as any).trace = trace
    } catch (error) {
      console.warn('Failed to build trace:', error)
    }
  }

  return resolvedAnswer
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
