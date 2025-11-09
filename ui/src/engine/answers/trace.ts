/**
 * Answer Trace Builder
 * 
 * Builds deterministic explanation traces showing how answers were computed.
 */

import type { ZoningAnswer } from './rules'
import type { CodeCitation } from './rules'
import type { CitationWithVersion } from './citations'

export type TraceStepType = 'rule' | 'overlay' | 'exception' | 'override'

export interface TraceStep {
  type: TraceStepType
  id: string
  op?: 'replace' | 'add' | 'min' | 'max'
  expr: string
  value: number
  citations: Array<CodeCitation | CitationWithVersion>
}

export interface AnswerTrace {
  answer_id: string
  jurisdiction_id: string
  district: string
  intent: string
  units: string
  steps: TraceStep[]
  provenance: 'rule' | 'overlay' | 'exception' | 'override' | 'conflict'
  final_value: number | null
  conflict: boolean
}

/**
 * Build trace from answer and resolution steps
 */
export function buildTrace(
  answer: ZoningAnswer,
  jurisdictionId: string,
  district: string,
  steps: TraceStep[]
): AnswerTrace {
  // Ensure first step is a rule
  if (steps.length === 0 || steps[0].type !== 'rule') {
    throw new Error('Trace must start with a rule step')
  }

  // Determine provenance from last step type
  const lastStep = steps[steps.length - 1]
  let provenance: AnswerTrace['provenance'] = lastStep.type as any
  if (answer.status === 'needs_review') {
    provenance = 'conflict'
  }

  // Final value is null if conflict, otherwise from answer
  const finalValue = answer.status === 'needs_review' ? null : answer.value ?? null

  return {
    answer_id: answer.answer_id,
    jurisdiction_id: jurisdictionId,
    district,
    intent: answer.intent,
    units: answer.unit || '',
    steps,
    provenance,
    final_value: finalValue,
    conflict: answer.status === 'needs_review',
  }
}

/**
 * Create a rule step
 */
export function createRuleStep(
  ruleId: string,
  value: number,
  expr: string,
  citations: Array<CodeCitation | CitationWithVersion>
): TraceStep {
  return {
    type: 'rule',
    id: ruleId,
    expr,
    value,
    citations,
  }
}

/**
 * Create an overlay step
 */
export function createOverlayStep(
  overlayId: string,
  op: 'replace' | 'add' | 'min' | 'max',
  prevValue: number,
  adjustmentValue: number,
  resultValue: number,
  citations: Array<CodeCitation | CitationWithVersion>
): TraceStep {
  let expr: string
  switch (op) {
    case 'replace':
      expr = `${adjustmentValue}`
      break
    case 'add':
      expr = `prev + ${adjustmentValue}`
      break
    case 'min':
      expr = `max(prev, ${adjustmentValue})`
      break
    case 'max':
      expr = `min(prev, ${adjustmentValue})`
      break
  }

  return {
    type: 'overlay',
    id: overlayId,
    op,
    expr,
    value: resultValue,
    citations,
  }
}

/**
 * Create an exception step
 */
export function createExceptionStep(
  exceptionId: string,
  op: 'replace' | 'add' | 'min' | 'max',
  prevValue: number,
  adjustmentValue: number,
  resultValue: number,
  citations: Array<CodeCitation | CitationWithVersion>
): TraceStep {
  let expr: string
  switch (op) {
    case 'replace':
      expr = `${adjustmentValue}`
      break
    case 'add':
      expr = `prev + ${adjustmentValue}`
      break
    case 'min':
      expr = `max(prev, ${adjustmentValue})`
      break
    case 'max':
      expr = `min(prev, ${adjustmentValue})`
      break
  }

  return {
    type: 'exception',
    id: exceptionId,
    op,
    expr,
    value: resultValue,
    citations,
  }
}

/**
 * Create an override step
 */
export function createOverrideStep(
  overrideId: string,
  value: number,
  citations: Array<CodeCitation | CitationWithVersion>
): TraceStep {
  return {
    type: 'override',
    id: overrideId,
    op: 'replace',
    expr: `${value}`,
    value,
    citations,
  }
}

